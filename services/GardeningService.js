import { PLANTS, HARDINESS_ZONES } from '../data/plants';

/**
 * Determines the hardiness zone from a US zip code or Canadian postal code.
 * This is a simplified mapping for MVP purposes.
 * @param {string} postalCode - The user's postal or zip code.
 * @returns {number|null} The hardiness zone number, or null if not found.
 */
const getZoneFromPostalCode = (code) => {
  if (!code) return null;
  const firstChar = code.charAt(0).toUpperCase();

  // Canadian Postal Codes (by first letter)
  const canadianZones = {
    'A': 6, // Newfoundland
    'B': 6, // Nova Scotia
    'C': 5, // PEI
    'E': 5, // New Brunswick
    'G': 5, // Quebec East
    'H': 6, // Montreal
    'J': 5, // Quebec West
    'K': 5, // Eastern Ontario (e.g., Ottawa)
    'L': 6, // Central Ontario
    'M': 7, // Toronto
    'N': 6, // Southwestern Ontario
    'P': 4, // Northern Ontario
    'R': 4, // Manitoba
    'S': 3, // Saskatchewan
    'T': 4, // Alberta
    'V': 8, // British Columbia
    'X': 1, // Northwest Territories / Nunavut
    'Y': 2, // Yukon
  };

  if (isNaN(parseInt(firstChar, 10))) { // It's a Canadian postal code if the first char is a letter
    return canadianZones[firstChar] || null;
  }

  // US Zip Codes (by first digit)
  const usZones = {
    '0': 6, '1': 6, '2': 7, '3': 8, '4': 6,
    '5': 5, '6': 5, '7': 8, '8': 8, '9': 9,
  };
  return usZones[firstChar] || null;
};


/**
 * Fetches climate data based on a postal code.
 * @param {string} postalCode - The postal or zip code.
 * @returns {object|null} Climate data object or null if zone not found.
 */
export const fetchClimateData = (postalCode) => {
  const zone = getZoneFromPostalCode(postalCode);
  if (!zone) {
    return null;
  }
  const zoneData = HARDINESS_ZONES[zone];
  return {
    hardinessZone: zone,
    lastFrostDate: zoneData.lastFrostDate,
    firstFrostDate: zoneData.firstFrostDate,
  };
};

/**
 * Generates a full schedule of tasks for a given plant based on frost dates.
 * @param {object} plant - The plant object from our database.
 * @param {string} lastFrostDate - The user's last spring frost date (YYYY-MM-DD).
 * @returns {array} A list of task objects with dates and descriptions.
 */
const generateTasksForPlant = (plant, lastFrostDate) => {
  const tasks = [];
  const lastFrost = new Date(`${lastFrostDate}T00:00:00`);

  if (plant.startIndoorsWeeksBefore != null) {
    const date = new Date(lastFrost);
    date.setDate(date.getDate() - plant.startIndoorsWeeksBefore * 7);
    tasks.push({
      plantName: plant.name,
      task: `🌱 Start ${plant.name} seeds indoors`,
      date: date.toISOString(),
      type: 'start-indoors',
    });
  }
  if (plant.directSowWeeksAfterLastFrost != null) {
    const date = new Date(lastFrost);
    date.setDate(date.getDate() + plant.directSowWeeksAfterLastFrost * 7);
    tasks.push({
      plantName: plant.name,
      task: `🌿 Sow ${plant.name} seeds outdoors`,
      date: date.toISOString(),
      type: 'direct-sow',
    });
  }
  if (plant.transplantWeeksAfterLastFrost != null) {
    const date = new Date(lastFrost);
    date.setDate(date.getDate() + plant.transplantWeeksAfterLastFrost * 7);
    tasks.push({
      plantName: plant.name,
      task: ` transplant ${plant.name} seedlings outside`,
      date: date.toISOString(),
      type: 'transplant',
    });
  }
  return tasks;
};

/**
 * Gets a list of all possible planting tasks for a given month.
 * @param {string} lastFrostDate - The user's last spring frost date (YYYY-MM-DD).
 * @param {number} monthIndex - The month index (0-11).
 * @returns {array} A sorted list of tasks for that month.
 */
export const getTasksForMonth = (lastFrostDate, monthIndex) => {
  let allTasks = [];
  PLANTS.forEach(plant => {
    const plantTasks = generateTasksForPlant(plant, lastFrostDate);
    allTasks = [...allTasks, ...plantTasks];
  });
  const monthTasks = allTasks.filter(task => new Date(task.date).getMonth() === monthIndex);
  monthTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  return monthTasks;
};

/**
 * Determines which plants can still be safely planted today to mature before the first frost.
 * @param {string} firstFrostDate - The user's first fall frost date (YYYY-MM-DD).
 * @returns {array} A list of plant objects that are safe to plant.
 */
export const getPlantableNow = (firstFrostDate) => {
  if (!firstFrostDate) return [];
  const today = new Date();
  const firstFrost = new Date(`${firstFrostDate}T00:00:00`);
  const safetyBuffer = 14; 
  return PLANTS.filter(plant => {
    if (plant.daysToMaturity) {
      const expectedHarvest = new Date(today);
      expectedHarvest.setDate(today.getDate() + plant.daysToMaturity + safetyBuffer);
      return expectedHarvest < firstFrost;
    }
    return false;
  });
};

/**
 * **-- NEW UPGRADED FUNCTION --**
 * Generates a full lifecycle of tasks for the user's garden for the upcoming week.
 * @param {array} myGarden - The user's garden array from AsyncStorage.
 * @param {string} lastFrostDate - The user's last spring frost date (YYYY-MM-DD).
 * @returns {array} A sorted list of tasks for the next 7 days.
 */
export const getUpcomingTasksForMyGarden = (myGarden, lastFrostDate, firstFrostDate) => {
  const allTasks = getAllUpcomingTasksForMyGarden(myGarden, lastFrostDate, firstFrostDate);
  const today = new Date();
  
  // Filter for tasks in the next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingTasks = allTasks.filter(task => {
    const taskDate = new Date(task.date);
    // Include tasks from the last 3 days (in case they were missed) up to next week
    return taskDate >= new Date(new Date().setDate(today.getDate() - 3)) && taskDate <= nextWeek;
  });

  return upcomingTasks;
};

/**
 * Generates a full lifecycle of tasks for all plants in the user's garden.
 * @param {array} myGarden - The user's garden array from AsyncStorage.
 * @param {string} lastFrostDate - The user's last spring frost date (YYYY-MM-DD).
 * @returns {array} A sorted list of all upcoming tasks.
 */
export const getAllUpcomingTasksForMyGarden = (myGarden, lastFrostDate, firstFrostDate) => {
  if (!myGarden || myGarden.length === 0) {
    return [];
  }

  const firstFrost = firstFrostDate ? new Date(`${firstFrostDate}T00:00:00`) : null;
  let allTasks = [];

  myGarden.forEach(gardenEntry => {
    if (gardenEntry.status === 'harvested') {
      return; // Skip harvested plants
    }

    const plantDetails = PLANTS.find(p => p.id === gardenEntry.plantId);
    if (plantDetails) {
      const plantedDate = new Date(gardenEntry.plantedDate);
      const harvestDate = new Date(plantedDate);
      harvestDate.setDate(harvestDate.getDate() + plantDetails.daysToMaturity);

      // If a nickname is provided, use it to create a display name, otherwise just use the plant's name.
      const displayName = gardenEntry.nickname ? `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

      // --- LATE PLANTING CHECK ---
      if (firstFrost && plantDetails.daysToMaturity) {
        const safetyBuffer = 14; // Or another value from config
        const estimatedHarvestDate = new Date(plantedDate);
        estimatedHarvestDate.setDate(plantedDate.getDate() + plantDetails.daysToMaturity + safetyBuffer);

        if (estimatedHarvestDate > firstFrost) {
          // This plant is at risk, check for critical tasks
          if (plantDetails.criticalTasks) {
            plantDetails.criticalTasks.forEach(criticalTask => {
              if (criticalTask.condition === "LATE_PLANTING") {
                const taskDate = new Date(plantedDate);
                taskDate.setDate(taskDate.getDate() + criticalTask.daysAfterPlanting);

                // Only add the task if it's not in the distant past
                if (taskDate <= harvestDate) {
                   allTasks.push({
                    id: `${gardenEntry.id}-critical-${criticalTask.task.replace(/\s+/g, '')}`,
                    plantName: displayName,
                    task: `⚠️ ${criticalTask.task}`,
                    date: taskDate.toISOString(),
                    type: 'critical',
                  });
                }
              }
            });
          }
        }
      }

      // --- Generate Recurring Care Tasks ---
      if (plantDetails.careTasks) {
        plantDetails.careTasks.forEach(careTask => {
          let taskDate = new Date(plantedDate);
          taskDate.setDate(taskDate.getDate() + careTask.daysAfterPlanting);

          // Use the original care task name, but associate it with the specific plant instance's display name.
          const taskDescription = `🔧 ${careTask.name.replace(plantDetails.name, '').trim()}`;


          if (careTask.recurring) {
            while (taskDate <= harvestDate) {
              // If plant isn't frost tolerant, don't schedule tasks after the first frost date.
              if (firstFrost && !plantDetails.frostTolerant && taskDate > firstFrost) {
                break;
              }
              allTasks.push({
                id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
                plantName: displayName,
                task: `${taskDescription} for ${displayName}`,
                date: taskDate.toISOString(),
                type: 'care'
              });
              taskDate.setDate(taskDate.getDate() + careTask.recurring);
            }
          } else if (taskDate <= harvestDate) {
            // Also check non-recurring tasks
            if (!firstFrost || plantDetails.frostTolerant || taskDate <= firstFrost) {
              allTasks.push({
                id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
                plantName: displayName,
                task: `${taskDescription} for ${displayName}`,
                date: taskDate.toISOString(),
                type: 'care'
              });
            }
          }
        });
      }

      // --- Generate Recurring Watering Tasks ---
      if (plantDetails.wateringFrequencyDays) {
        let waterDate = new Date(plantedDate);
        while (waterDate <= harvestDate) {
          // If plant isn't frost tolerant, don't schedule tasks after the first frost date.
          if (firstFrost && !plantDetails.frostTolerant && waterDate > firstFrost) {
            break;
          }
          allTasks.push({
            id: `${gardenEntry.id}-water-${waterDate.toISOString()}`,
            plantName: displayName,
            task: `💧 Water ${displayName}`,
            date: waterDate.toISOString(),
            type: 'water'
          });
          waterDate.setDate(waterDate.getDate() + plantDetails.wateringFrequencyDays);
        }
      }

      // --- Generate Harvest Window Task ---
      allTasks.push({
        id: `${gardenEntry.id}-harvest-${harvestDate.toISOString()}`,
        plantName: displayName,
        task: `🥕 Harvest ${displayName}`,
        date: harvestDate.toISOString(),
        type: 'harvest'
      });
    }
  });

  // Sort tasks by date
  allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  return allTasks;
};

/**
 * Fetches and analyzes the weather forecast to generate dynamic alerts.
 * @param {number} latitude - The latitude.
 * @param {number} longitude - The longitude.
 * @returns {Promise<object|null>} An object with current weather, hourly forecast, and an array of alerts, or null on failure.
 */
export const getWeatherForecast = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    return null;
  }

  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;
  const userAgent = "GardenCommand/1.0 https://github.com/your-username/garden-command";

  try {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (!response.ok) {
      console.error(`Weather API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (!data.properties || !data.properties.timeseries || data.properties.timeseries.length === 0) {
      console.error("Weather API response is missing or has empty timeseries data.");
      return null;
    }

    const { timeseries } = data.properties;
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const currentWeather = {
      time: timeseries[0].time,
      temperature: timeseries[0].data.instant.details.air_temperature,
      symbol_code: timeseries[0].data.next_1_hours?.summary.symbol_code,
    };

    const hourlyForecast = timeseries
      .filter(item => {
        const itemDate = new Date(item.time);
        return itemDate > now && itemDate <= next24Hours;
      })
      .map(item => ({
        time: item.time,
        temperature: item.data.instant.details.air_temperature,
      }));

    const alerts = [];
    let frostFound = false;
    let hardFreezeFound = false;
    let totalRainNext24h = 0;
    const dailyMaxTemps = {};

    for (const item of timeseries) {
      const itemDate = new Date(item.time);
      if (itemDate > next48Hours) break;

      // --- Frost and Freeze Check ---
      const temp = item.data.instant.details.air_temperature;
      if (!frostFound && temp <= 0) {
        alerts.push({
          type: 'FROST',
          message: `❄️ Frost Alert! Low of ${Math.round(temp)}°C expected. Protect sensitive plants.`,
          date: item.time,
        });
        frostFound = true; // Add only one frost alert
      }
      if (!hardFreezeFound && temp <= -2) { // Typical definition of a hard freeze
        hardFreezeFound = true;
      }

      // --- Rain Check (for next 24h) ---
      if (itemDate <= next24Hours && item.data.next_1_hours) {
        totalRainNext24h += item.data.next_1_hours.details.precipitation_amount;
      }

      // --- Heatwave Data Aggregation ---
      const dayString = itemDate.toISOString().split('T')[0];
      if (!dailyMaxTemps[dayString]) {
        dailyMaxTemps[dayString] = -Infinity;
      }
      if (item.data.instant.details.air_temperature > dailyMaxTemps[dayString]) {
        dailyMaxTemps[dayString] = item.data.instant.details.air_temperature;
      }
    }

    // --- Heatwave Logic ---
    const dates = Object.keys(dailyMaxTemps).sort();
    if (dates.length >= 2) {
      // Check for two consecutive days over 30°C
      if (dailyMaxTemps[dates[0]] > 30 && dailyMaxTemps[dates[1]] > 30) {
        alerts.push({
          type: 'HEATWAVE',
          message: '☀️ Heatwave Advisory! Expect high temperatures this week. Provide extra water and shade for sensitive plants.',
          date: new Date().toISOString(), // Alert is for "now"
        });
      }
    }

    // --- Rain Logic ---
    if (totalRainNext24h > 10) { // Threshold for "heavy" rain in mm
       alerts.push({
          type: 'RAIN',
          message: `🌧️ Rain Incoming! Heavy rain (${Math.round(totalRainNext24h)}mm) is expected. You can skip watering.`,
          date: new Date().toISOString(), // Alert is for "now"
        });
    }

    return {
      currentWeather,
      hourlyForecast,
      alerts,
      hardFreezeWarning: hardFreezeFound,
    };

  } catch (error) {
    console.error("Failed to fetch or process weather data:", error);
    return null;
  }
};

/**
 * Generates dynamic, weather-based alert tasks based on the forecast and the user's garden.
 * @param {object} weatherData - The processed weather data object from getWeatherForecast.
 * @param {array} myGarden - The user's garden array.
 * @returns {array} A list of alert task objects.
 */
export const generateDynamicAlerts = (weatherData, myGarden) => {
  if (!weatherData || !weatherData.alerts) {
    return [];
  }

  const dynamicAlerts = [];
  const now = new Date().toISOString();

  // --- Process Generic Weather Alerts ---
  weatherData.alerts.forEach(alert => {
    let message = alert.message;
    // Tailor frost message to specific plants
    if (alert.type === 'FROST') {
      const sensitivePlants = myGarden
        .map(entry => PLANTS.find(p => p.id === entry.plantId))
        .filter(plant => plant && !plant.frostTolerant)
        .map(plant => plant.name);

      if (sensitivePlants.length > 0) {
        // Customize the message to be more specific
        const plantList = sensitivePlants.slice(0, 2).join(' and ');
        message = `❄️ Frost Alert! Protect sensitive plants like ${plantList}.`;
      }
    }

    dynamicAlerts.push({
      id: `alert-${alert.type}-${now}`,
      task: message,
      date: alert.date,
      type: 'alert',
    });
  });

  // --- Process Plant-Specific Conditional Alerts ---
  if (weatherData.hardFreezeWarning) {
    myGarden.forEach(entry => {
      const plantDetails = PLANTS.find(p => p.id === entry.plantId);
      if (plantDetails && plantDetails.conditionalAlerts) {
        plantDetails.conditionalAlerts.forEach(condAlert => {
          if (condAlert.condition === 'HARD_FREEZE_WARNING') {
            dynamicAlerts.push({
              id: `alert-hardfreeze-${plantDetails.id}-${now}`,
              task: `🥶 Hard Freeze Warning: ${condAlert.message}`,
              date: now,
              type: 'alert',
            });
          }
        });
      }
    });
  }

  // Remove duplicate alerts based on the task message
  const uniqueAlerts = Array.from(new Map(dynamicAlerts.map(item => [item.task, item])).values());

  return uniqueAlerts;
};