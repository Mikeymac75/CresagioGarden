import { PLANTS, HARDINESS_ZONES } from '../data/plants';
import { gardenEntrySchema, weatherSchema } from '../utils/validationSchemas';

// Configuration constants
const CONFIG = {
  SAFETY_BUFFER_DAYS: 14,
  MISSED_TASK_DAYS: 3,
  UPCOMING_TASK_DAYS: 7,
  HEAVY_RAIN_THRESHOLD_MM: 10,
  HEATWAVE_TEMP_CELSIUS: 30,
  HARD_FREEZE_TEMP_CELSIUS: -2,
  FROST_TEMP_CELSIUS: 0,
  USER_AGENT: "GardenCommand/1.0 https://github.com/your-username/garden-command",
  WEATHER_API_BASE_URL: "https://api.met.no/weatherapi/locationforecast/2.0/compact",
  WEATHER_API_TIMEOUT: 15000, // 15 seconds
  WEATHER_API_MAX_RETRIES: 3,
  WEATHER_API_RETRY_DELAY: 1000, // 1 second
};


// Task type constants
const TASK_TYPES = {
  START_INDOORS: 'start-indoors',
  DIRECT_SOW: 'direct-sow',
  TRANSPLANT: 'transplant',
  WATER: 'water',
  CARE: 'care',
  HARVEST: 'harvest',
  CRITICAL: 'critical',
  ALERT: 'alert'
};

// Alert type constants
const ALERT_TYPES = {
  FROST: 'FROST',
  HEATWAVE: 'HEATWAVE',
  RAIN: 'RAIN',
  HARD_FREEZE: 'HARD_FREEZE_WARNING'
};

/**
 * Enhanced utility functions
 */
const DateUtils = {
  /**
   * Creates a date from a string with proper timezone handling
   */
  createDate: (dateString) => {
    return new Date(`${dateString}T00:00:00`);
  },

  /**
   * Adds days to a date and returns a new date
   */
  addDays: (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  },

  /**
   * Gets the start and end of a date range
   */
  getDateRange: (fromDate, days) => {
    const endDate = DateUtils.addDays(fromDate, days);
    return { start: fromDate, end: endDate };
  },

  /**
   * Checks if a date is within a range
   */
  isDateInRange: (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
  }
};

/**
 * Validation utilities
 */
const ValidationUtils = {
  isValidPostalCode: (code) => {
    if (!code || typeof code !== 'string') return false;
    // US zip code (5 or 9 digits) or Canadian postal code (A1A 1A1 format)
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return usZipRegex.test(code) || canadianPostalRegex.test(code);
  },

  isValidCoordinates: (lat, lon) => {
    return typeof lat === 'number' && typeof lon === 'number' &&
           lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
};

export const REGIONS = {
  "Select a Region": null,
  "SWO, Ontario": {
    zone: "6b",
    lastFrostDate: "2023-05-15",
    firstFrostDate: "2023-10-05",
  },
  "Southern California": {
    zone: "10a",
    lastFrostDate: "2023-01-30",
    firstFrostDate: "2023-12-15",
  },
  "Northern Florida": {
    zone: "8b",
    lastFrostDate: "2023-03-01",
    firstFrostDate: "2023-11-20",
  },
  "British Columbia (Coastal)": {
    zone: "8b",
    lastFrostDate: "2023-04-20",
    firstFrostDate: "2023-10-25",
  },
  "Manitoba": {
    zone: "3b",
    lastFrostDate: "2023-05-24",
    firstFrostDate: "2023-09-15",
  }
};

/**
 * Fetches climate data from the hardcoded list based on region.
 */
export const fetchClimateData = (region) => {
  if (!region || !REGIONS[region]) {
    return { error: "Please select a valid region." };
  }

  try {
    const regionData = REGIONS[region];
    return {
      hardinessZone: regionData.zone,
      lastFrostDate: regionData.lastFrostDate,
      firstFrostDate: regionData.firstFrostDate,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching climate data:", error);
    return { error: "Failed to fetch climate data." };
  }
};

/**
 * Enhanced task generation with better organization
 */
const TaskGenerator = {
  /**
   * Generates planting tasks for a single plant
   */
  generatePlantingTasks: (plant, lastFrostDate) => {
    const tasks = [];
    const lastFrost = DateUtils.createDate(lastFrostDate);

    const taskConfigs = [
      {
        condition: plant.startIndoorsWeeksBefore != null,
        weeks: -plant.startIndoorsWeeksBefore,
        emoji: '🌱',
        action: 'Start seeds indoors',
        type: TASK_TYPES.START_INDOORS
      },
      {
        condition: plant.directSowWeeksAfterLastFrost != null,
        weeks: plant.directSowWeeksAfterLastFrost,
        emoji: '🌿',
        action: 'Sow seeds outdoors',
        type: TASK_TYPES.DIRECT_SOW
      },
      {
        condition: plant.transplantWeeksAfterLastFrost != null,
        weeks: plant.transplantWeeksAfterLastFrost,
        emoji: '🌿',
        action: 'Transplant seedlings outside',
        type: TASK_TYPES.TRANSPLANT
      }
    ];

    taskConfigs.forEach(config => {
      if (config.condition) {
        const taskDate = DateUtils.addDays(lastFrost, config.weeks * 7);
        tasks.push({
          plantName: plant.name,
          task: `${config.emoji} ${config.action} for ${plant.name}`,
          date: taskDate.toISOString(),
          type: config.type,
        });
      }
    });

    return tasks;
  },

  /**
   * Generates care tasks for a planted garden entry
   */
  generateCareTasks: (gardenEntry, plantDetails, harvestDate, firstFrost = null) => {
    const tasks = [];
    const plantedDate = new Date(gardenEntry.plantedDate);
    const displayName = gardenEntry.nickname ? 
      `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

    if (plantDetails.careTasks) {
      plantDetails.careTasks.forEach(careTask => {
        let taskDate = DateUtils.addDays(plantedDate, careTask.daysAfterPlanting);
        const baseTaskDescription = careTask.name.replace(plantDetails.name, '').trim();

        if (careTask.recurring) {
          while (taskDate <= harvestDate) {
            if (TaskGenerator.shouldSkipTask(taskDate, firstFrost, plantDetails.frostTolerant)) {
              break;
            }

            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `🔧 ${baseTaskDescription} for ${displayName}`,
              date: taskDate.toISOString(),
              type: TASK_TYPES.CARE
            });

            taskDate = DateUtils.addDays(taskDate, careTask.recurring);
          }
        } else if (taskDate <= harvestDate) {
          if (!TaskGenerator.shouldSkipTask(taskDate, firstFrost, plantDetails.frostTolerant)) {
            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `🔧 ${baseTaskDescription} for ${displayName}`,
              date: taskDate.toISOString(),
              type: TASK_TYPES.CARE
            });
          }
        }
      });
    }

    return tasks;
  },

  /**
   * Generates watering tasks
   */
  generateWateringTasks: (gardenEntry, plantDetails, harvestDate, firstFrost = null) => {
    const tasks = [];
    const plantedDate = new Date(gardenEntry.plantedDate);
    const displayName = gardenEntry.nickname ? 
      `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

    if (plantDetails.wateringFrequencyDays) {
      let waterDate = new Date(plantedDate);
      
      while (waterDate <= harvestDate) {
        if (TaskGenerator.shouldSkipTask(waterDate, firstFrost, plantDetails.frostTolerant)) {
          break;
        }

        tasks.push({
          id: `${gardenEntry.id}-water-${waterDate.toISOString()}`,
          plantName: displayName,
          task: `💧 Water ${displayName}`,
          date: waterDate.toISOString(),
          type: TASK_TYPES.WATER
        });

        waterDate = DateUtils.addDays(waterDate, plantDetails.wateringFrequencyDays);
      }
    }

    return tasks;
  },

  /**
   * Generates critical tasks for late plantings
   */
  generateCriticalTasks: (gardenEntry, plantDetails, harvestDate, firstFrost) => {
    const tasks = [];
    const plantedDate = new Date(gardenEntry.plantedDate);
    const displayName = gardenEntry.nickname ? 
      `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

    // Check if this is a late planting
    if (firstFrost && plantDetails.daysToMaturity) {
      const estimatedHarvestDate = DateUtils.addDays(plantedDate, 
        plantDetails.daysToMaturity + CONFIG.SAFETY_BUFFER_DAYS);

      if (estimatedHarvestDate > firstFrost && plantDetails.criticalTasks) {
        plantDetails.criticalTasks.forEach(criticalTask => {
          if (criticalTask.condition === "LATE_PLANTING") {
            const taskDate = DateUtils.addDays(plantedDate, criticalTask.daysAfterPlanting);

            if (taskDate <= harvestDate) {
              tasks.push({
                id: `${gardenEntry.id}-critical-${criticalTask.task.replace(/\s+/g, '')}`,
                plantName: displayName,
                task: `⚠️ ${criticalTask.task}`,
                date: taskDate.toISOString(),
                type: TASK_TYPES.CRITICAL,
              });
            }
          }
        });
      }
    }

    return tasks;
  },

  /**
   * Helper to determine if a task should be skipped due to frost
   */
  shouldSkipTask: (taskDate, firstFrost, isFrostTolerant) => {
    return firstFrost && !isFrostTolerant && taskDate > firstFrost;
  }
};

/**
 * Enhanced weather service with better error handling and caching
 */
const WeatherService = {
  cache: new Map(),
  cacheExpiry: 30 * 60 * 1000, // 30 minutes

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
      if (!frostFound && temp <= CONFIG.FROST_TEMP_CELSIUS) {
        alerts.push({
          type: ALERT_TYPES.FROST,
          message: `❄️ Frost Alert! Low of ${Math.round(temp)}°C expected. Protect sensitive plants.`,
          date: item.time,
        });
        frostFound = true;
      }
      
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
 * Enhanced public API functions
 */

/**
 * Gets tasks for a specific month with better filtering
 */
export const getTasksForMonth = (lastFrostDate, monthIndex) => {
  if (!ValidationUtils.isValidDate(lastFrostDate) || monthIndex < 0 || monthIndex > 11) {
    return [];
  }

  try {
    let allTasks = [];
    
    PLANTS.forEach(plant => {
      const plantTasks = TaskGenerator.generatePlantingTasks(plant, lastFrostDate);
      allTasks = [...allTasks, ...plantTasks];
    });

    const monthTasks = allTasks.filter(task => 
      new Date(task.date).getMonth() === monthIndex
    );

    return monthTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error generating monthly tasks:', error);
    return [];
  }
};

/**
 * Enhanced plantable now function with better safety margins
 */
export const getPlantableNow = (firstFrostDate) => {
  if (!ValidationUtils.isValidDate(firstFrostDate)) {
    return [];
  }

  try {
    const today = new Date();
    const firstFrost = DateUtils.createDate(firstFrostDate);

    return PLANTS.filter(plant => {
      if (!plant.daysToMaturity) return false;
      
      const expectedHarvest = DateUtils.addDays(today, 
        plant.daysToMaturity + CONFIG.SAFETY_BUFFER_DAYS);
      
      return expectedHarvest < firstFrost;
    });
  } catch (error) {
    console.error('Error determining plantable crops:', error);
    return [];
  }
};

/**
 * Enhanced upcoming tasks function with better organization
 */
export const getUpcomingTasksForMyGarden = (myGarden, lastFrostDate, firstFrostDate) => {
  if (!Array.isArray(myGarden)) return [];
  
  try {
    const allTasks = getAllUpcomingTasksForMyGarden(myGarden, lastFrostDate, firstFrostDate);
    const today = new Date();
    const { start: rangeStart, end: rangeEnd } = DateUtils.getDateRange(
      DateUtils.addDays(today, -CONFIG.MISSED_TASK_DAYS),
      CONFIG.UPCOMING_TASK_DAYS + CONFIG.MISSED_TASK_DAYS
    );

    return allTasks.filter(task => {
      const taskDate = new Date(task.date);
      return DateUtils.isDateInRange(taskDate, rangeStart, rangeEnd);
    });
  } catch (error) {
    console.error('Error generating upcoming tasks:', error);
    return [];
  }
};

/**
 * Enhanced all tasks function with modular task generation
 */
export const getAllUpcomingTasksForMyGarden = (myGarden, lastFrostDate, firstFrostDate) => {
  if (!Array.isArray(myGarden) || myGarden.length === 0) {
    return [];
  }

  try {
    const firstFrost = firstFrostDate ? DateUtils.createDate(firstFrostDate) : null;
    let allTasks = [];

    myGarden.forEach(gardenEntry => {
      if (gardenEntry.status === 'harvested') return;

      const plantDetails = PLANTS.find(p => p.id === gardenEntry.plantId);
      if (!plantDetails) return;

      const plantedDate = new Date(gardenEntry.plantedDate);
      const harvestDate = DateUtils.addDays(plantedDate, plantDetails.daysToMaturity);
      const displayName = gardenEntry.nickname ? 
        `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

      // Generate different types of tasks
      const criticalTasks = TaskGenerator.generateCriticalTasks(
        gardenEntry, plantDetails, harvestDate, firstFrost
      );
      
      const careTasks = TaskGenerator.generateCareTasks(
        gardenEntry, plantDetails, harvestDate, firstFrost
      );
      
      const wateringTasks = TaskGenerator.generateWateringTasks(
        gardenEntry, plantDetails, harvestDate, firstFrost
      );

      // Add harvest task
      const harvestTask = {
        id: `${gardenEntry.id}-harvest-${harvestDate.toISOString()}`,
        plantName: displayName,
        task: `🥕 Harvest ${displayName}`,
        date: harvestDate.toISOString(),
        type: TASK_TYPES.HARVEST
      };

      allTasks.push(...criticalTasks, ...careTasks, ...wateringTasks, harvestTask);
    });

    return allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error generating all garden tasks:', error);
    return [];
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
export const generateDynamicAlerts = (weatherData, myGarden) => {
  if (!weatherData?.alerts || !Array.isArray(myGarden)) {
    return [];
  }

  try {
    const dynamicAlerts = [];
    const now = new Date().toISOString();

    // Process weather alerts with plant-specific customization
    weatherData.alerts.forEach(alert => {
      let message = alert.message;
      
      if (alert.type === ALERT_TYPES.FROST) {
        const sensitivePlants = myGarden
          .map(entry => PLANTS.find(p => p.id === entry.plantId))
          .filter(plant => plant && !plant.frostTolerant)
          .map(plant => plant.name);

        if (sensitivePlants.length > 0) {
          const uniquePlants = [...new Set(sensitivePlants)];
          const plantList = uniquePlants.slice(0, 2).join(' and ');
          const moreText = uniquePlants.length > 2 ? ` and ${uniquePlants.length - 2} others` : '';
          message = `❄️ Frost Alert! Protect ${plantList}${moreText}.`;
        }
      }

      dynamicAlerts.push({
        id: `alert-${alert.type}-${Date.now()}`,
        task: message,
        date: alert.date,
        type: TASK_TYPES.ALERT,
        priority: alert.type === ALERT_TYPES.FROST ? 'high' : 'medium'
      });
    });

    // Process plant-specific conditional alerts
    if (weatherData.hardFreezeWarning) {
      myGarden.forEach(entry => {
        const plantDetails = PLANTS.find(p => p.id === entry.plantId);
        if (plantDetails?.conditionalAlerts) {
          plantDetails.conditionalAlerts.forEach(condAlert => {
            if (condAlert.condition === ALERT_TYPES.HARD_FREEZE) {
              dynamicAlerts.push({
                id: `alert-hardfreeze-${plantDetails.id}-${Date.now()}`,
                task: `🥶 ${condAlert.message}`,
                date: now,
                type: TASK_TYPES.ALERT,
                priority: 'high'
              });
            }
          });
        }
      });
    }

    // Remove duplicates and sort by priority
    const uniqueAlerts = Array.from(
      new Map(dynamicAlerts.map(item => [item.task, item])).values()
    );

    return uniqueAlerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  } catch (error) {
    console.error('Error generating dynamic alerts:', error);
    return [];
  }
};

/**
 * New utility functions for better service integration
 */

/**
 * Gets garden statistics
 */
export const getGardenStatistics = (myGarden) => {
  if (!Array.isArray(myGarden)) return null;

  try {
    const stats = {
      totalPlants: myGarden.length,
      activeGrowth: myGarden.filter(entry => entry.status !== 'harvested').length,
      readyToHarvest: 0,
      plantTypes: new Set(),
      averageDaysToHarvest: 0
    };

    const today = new Date();
    let totalMaturityDays = 0;

    myGarden.forEach(entry => {
      const plantDetails = PLANTS.find(p => p.id === entry.plantId);
      if (plantDetails) {
        stats.plantTypes.add(plantDetails.name);
        
        if (entry.status !== 'harvested' && plantDetails.daysToMaturity) {
          const plantedDate = new Date(entry.plantedDate);
          const harvestDate = DateUtils.addDays(plantedDate, plantDetails.daysToMaturity);
          
          if (harvestDate <= today) {
            stats.readyToHarvest++;
          }
          
          totalMaturityDays += plantDetails.daysToMaturity;
        }
      }
    });

    stats.plantTypes = stats.plantTypes.size;
    stats.averageDaysToHarvest = stats.totalPlants > 0 ? 
      Math.round(totalMaturityDays / stats.totalPlants) : 0;

    return stats;
  } catch (error) {
    console.error('Error calculating garden statistics:', error);
    return null;
  }
};

/**
 * Validates garden entry data
 */
export const validateGardenEntry = async (entry) => {
  try {
    await gardenEntrySchema.validate(entry, { abortEarly: false });
    const plantExists = PLANTS.find(p => p.id === entry.plantId);
    if (!plantExists) {
      return {
        isValid: false,
        errors: ['Plant not found in database']
      };
    }
    return { isValid: true, errors: [] };
  } catch (err) {
    return { isValid: false, errors: err.errors };
  }
};

/**
 * Calculates days until harvest for a given plant entry
 */
export const getDaysUntilHarvest = (plantedDate, daysToMaturity) => {
  if (!ValidationUtils.isValidDate(plantedDate) || !daysToMaturity) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const harvestDate = DateUtils.addDays(new Date(plantedDate), daysToMaturity);
  harvestDate.setHours(0, 0, 0, 0);

  return Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
};


export { TASK_TYPES, ALERT_TYPES, CONFIG };