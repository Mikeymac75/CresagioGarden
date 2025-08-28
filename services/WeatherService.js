import { DateUtils } from './utils/DateUtils';
import { ValidationUtils } from './utils/ValidationUtils';
import { ALERT_TYPES, CONFIG } from './constants';
import { loadPlantDetails } from './PlantService';
import { weatherSchema } from '../utils/validationSchemas';

/**
 * Enhanced weather service with better error handling and caching
 */
const WeatherService = {
  cache: new Map(),
  cacheExpiry: 60 * 60 * 1000, // 60 minutes

  /**
   * Gets cached weather data if available and not expired
   */
  getCachedWeather: (lat, lon) => {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = WeatherService.cache.get(key);

    if (cached && (Date.now() - cached.timestamp) < WeatherService.cacheExpiry) {
      return cached.data;
    }

    return null;
  },

  /**
   * Sets weather data in cache
   */
  setCachedWeather: (lat, lon, data) => {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    WeatherService.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  /**
   * Processes weather timeseries data
   */
  processWeatherData: (timeseries) => {
    const now = new Date();
    const next24Hours = DateUtils.addDays(now, 1);
    const next48Hours = DateUtils.addDays(now, 2);

    const currentWeather = {
      time: timeseries[0].time,
      temperature: parseFloat(timeseries[0].data.instant.details.air_temperature),
      symbol_code: timeseries[0].data.next_1_hours?.summary.symbol_code,
    };

    const hourlyForecast = timeseries
      .filter(item => {
        const itemDate = new Date(item.time);
        return itemDate > now && itemDate <= next24Hours;
      })
      .map(item => ({
        time: item.time,
        temperature: parseFloat(item.data.instant.details.air_temperature),
      }));

    const alerts = [];
    let frostFound = false;
    let hardFreezeFound = false;
    let totalRainNext24h = 0;
    const dailyMaxTemps = {};

    // Process each time point for alerts
    for (const item of timeseries) {
      const itemDate = new Date(item.time);
      if (itemDate > next48Hours) break;

      const temp = parseFloat(item.data.instant.details.air_temperature);

      // Frost and freeze detection
      if (!hardFreezeFound && temp <= CONFIG.HARD_FREEZE_TEMP_CELSIUS) {
        hardFreezeFound = true;
      }

      // Rain accumulation
      if (itemDate <= next24Hours && item.data.next_1_hours?.details?.precipitation_amount) {
        totalRainNext24h += parseFloat(item.data.next_1_hours.details.precipitation_amount);
      }

      // Daily maximum temperature tracking
      const dayString = itemDate.toISOString().split('T')[0];
      if (!dailyMaxTemps[dayString] || temp > dailyMaxTemps[dayString]) {
        dailyMaxTemps[dayString] = temp;
      }
    }

    // Heatwave detection
    const dates = Object.keys(dailyMaxTemps).sort();
    if (dates.length >= 2) {
      const consecutiveHotDays = dates.filter(date =>
        dailyMaxTemps[date] > CONFIG.HEATWAVE_TEMP_CELSIUS
      ).length;

      if (consecutiveHotDays >= 2) {
        alerts.push({
          type: ALERT_TYPES.HEATWAVE,
          message: '☀️ Heatwave Advisory! High temperatures expected. Provide extra water and shade.',
          date: now.toISOString(),
        });
      }
    }

    // Heavy rain detection
    if (totalRainNext24h > CONFIG.HEAVY_RAIN_THRESHOLD_MM) {
      alerts.push({
        type: ALERT_TYPES.RAIN,
        message: `🌧️ Heavy rain expected (${Math.round(totalRainNext24h)}mm). Skip watering.`,
        date: now.toISOString(),
        modifiesTasks: 'water',
      });
    }

    return {
      currentWeather,
      hourlyForecast,
      alerts,
      hardFreezeWarning: hardFreezeFound,
    };
  }
};

/**
 * A utility to introduce a delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust weather forecast function with caching, retries, and validation.
 */
export const getWeatherForecast = async (latitude, longitude) => {
  if (!ValidationUtils.isValidCoordinates(latitude, longitude)) {
    return { error: 'Invalid coordinates provided' };
  }

  // Check cache first
  const cached = WeatherService.getCachedWeather(latitude, longitude);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.WEATHER_API_BASE_URL}?lat=${latitude}&lon=${longitude}`;

  let lastError = null;

  for (let attempt = 1; attempt <= CONFIG.WEATHER_API_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': CONFIG.USER_AGENT },
        timeout: CONFIG.WEATHER_API_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate the structure of the API response
      await weatherSchema.validate(data);

      const weatherData = WeatherService.processWeatherData(data.properties.timeseries);

      // Cache the successful result
      WeatherService.setCachedWeather(latitude, longitude, weatherData);

      return weatherData;

    } catch (error) {
      lastError = error;
      console.warn(`Weather forecast attempt ${attempt} failed:`, error.message);

      if (attempt < CONFIG.WEATHER_API_MAX_RETRIES) {
        const retryDelay = CONFIG.WEATHER_API_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    }
  }

  console.error("Weather forecast error after all retries:", lastError);
  return {
    error: `Failed to fetch weather data: ${lastError.message}`,
    fallback: true
  };
};

/**
 * Enhanced dynamic alerts with better customization
 */
export const generateDynamicAlerts = (weatherData, myGarden, allPlants) => {
  if (!weatherData || weatherData.error || !weatherData.hourlyForecast || !Array.isArray(myGarden) || !Array.isArray(allPlants)) {
    return [];
  }

  try {
    const dynamicAlerts = [];
    const now = new Date();

    const forecastTemperatures = weatherData.hourlyForecast.map(f => f.temperature);
    const minTempCelsius = Math.min(...forecastTemperatures);
    const maxTempCelsius = Math.max(...forecastTemperatures);
    const minTempFahrenheit = (minTempCelsius * 9/5) + 32;
    const maxTempFahrenheit = (maxTempCelsius * 9/5) + 32;

    myGarden.forEach(entry => {
      let plantDetails;
      if (entry.detailsFile) {
        // It's an indexed plant, load its details
        plantDetails = loadPlantDetails(entry.detailsFile, entry.plantId.toString());
      } else {
        // It's a custom plant (or pre-existing one), find it in the full list
        plantDetails = allPlants.find(p => p.id === entry.plantId);
      }

      if (!plantDetails || !plantDetails.temperature) {
        return;
      }

      const { absoluteMinF, optimalLowF, optimalHighF } = plantDetails.temperature;

      if (minTempFahrenheit <= absoluteMinF) {
        dynamicAlerts.push({
          id: `alert-abs-min-${plantDetails.id}-${now.getTime()}`,
          task: `❄️ Dangerously low temperatures for ${plantDetails.name}! Cover immediately.`,
          date: now.toISOString(),
          type: 'alert',
          priority: 'high',
        });
      } else if (minTempFahrenheit <= optimalLowF) {
        dynamicAlerts.push({
          id: `alert-opt-low-${plantDetails.id}-${now.getTime()}`,
          task: `📉 Low temperature warning for ${plantDetails.name}. Growth may be stunted.`,
          date: now.toISOString(),
          type: 'alert',
          priority: 'medium',
        });
      }

      if (maxTempFahrenheit >= optimalHighF) {
        dynamicAlerts.push({
          id: `alert-opt-high-${plantDetails.id}-${now.getTime()}`,
          task: `☀️ High temperature warning for ${plantDetails.name}. Ensure adequate water and shade.`,
          date: now.toISOString(),
          type: 'alert',
          priority: 'medium',
        });
      }
    });

    // Remove duplicates and sort by priority
    const uniqueAlerts = Array.from(
      new Map(dynamicAlerts.map(item => [item.task, item])).values()
    );

    return uniqueAlerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

  } catch (error) {
    console.error('Error generating dynamic alerts:', error);
    return [];
  }
};