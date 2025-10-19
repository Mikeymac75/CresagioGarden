import { DateUtils } from './utils/DateUtils';
import { ValidationUtils } from './utils/ValidationUtils';
import { loadPlants, loadPlantDetails } from './PlantService';
import { getWeatherForecast } from './WeatherService';
import { getWateringPreferences } from './UserPreferenceService';
import { TASK_TYPES, CONFIG } from './constants';
import SEASONAL_TASKS from '../data/seasonal_tasks.json';

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
  generateCareTasks: (gardenEntry, plantDetails, harvestDate, plantSpecificKillDate, wateringPrefs = {}) => {
    const tasks = [];
    const plantedDate = new Date(gardenEntry.plantedDate);
    const displayName = gardenEntry.nickname ?
      `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

    if (plantDetails.careTasks) {
      plantDetails.careTasks.forEach(careTask => {
        let taskDate = DateUtils.addDays(plantedDate, careTask.daysAfterPlanting);
        const isWateringTask = careTask.name.toLowerCase() === 'watering';
        const isHarvestTask = /harvest|check for ripe/i.test(careTask.name);

        let taskType;
        let taskEmoji;

        if (isHarvestTask) {
          taskType = TASK_TYPES.HARVEST;
          taskEmoji = '🥕';
        } else if (isWateringTask) {
          taskType = TASK_TYPES.WATER;
          taskEmoji = '💧';
        } else {
          taskType = TASK_TYPES.CARE;
          taskEmoji = '🔧';
        }

        const baseTaskDescription = careTask.name.replace(plantDetails.name, '').trim();

        if (careTask.recurring) {
          let recurrence = careTask.recurring;
          if (isWateringTask) {
            recurrence = gardenEntry.customWateringDays
              || wateringPrefs[plantDetails.id]?.defaultWateringDays
              || careTask.recurring;
          }

          let loopEndDate = harvestDate;

          if (plantDetails.harvestType === 'continuous' && plantDetails.harvestPeriodDays && isHarvestTask) {
            loopEndDate = DateUtils.addDays(harvestDate, plantDetails.harvestPeriodDays);
          }

          while (taskDate <= loopEndDate) {
            if (TaskGenerator.shouldSkipTask(taskDate, plantSpecificKillDate)) {
              break;
            }

            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `${taskEmoji} ${baseTaskDescription} ${displayName}`,
              description: isHarvestTask ? plantDetails.harvestInstructions : careTask.description,
              date: taskDate.toISOString(),
              type: taskType
            });

            taskDate = DateUtils.addDays(taskDate, recurrence);
          }
        } else if (taskDate <= harvestDate) {
          if (!TaskGenerator.shouldSkipTask(taskDate, plantSpecificKillDate)) {
            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `${taskEmoji} ${baseTaskDescription} for ${displayName}`,
              description: isHarvestTask ? plantDetails.harvestInstructions : careTask.description,
              date: taskDate.toISOString(),
              type: taskType
            });
          }
        }
      });
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
   * Helper to determine if a task should be skipped due to plant-specific kill date
   */
  shouldSkipTask: (taskDate, plantSpecificKillDate) => {
    return plantSpecificKillDate && taskDate > plantSpecificKillDate;
  }
};

/**
 * Gets all upcoming planting tasks for all plants
 */
export const getAllPlantingTasks = async (lastFrostDate, seedBank = []) => {
  if (!ValidationUtils.isValidDate(lastFrostDate)) {
    return [];
  }

  try {
    let allTasks = [];
    const allPlants = await loadPlants();
    const seedBankSet = new Set(seedBank);

    const plantsToProcess = seedBank.length > 0 ?
      allPlants.filter(p => seedBankSet.has(p.id)) :
      allPlants;


    if (!Array.isArray(plantsToProcess)) {
      console.error('TaskService: loadPlants did not return an array. Received:', plantsToProcess);
      return [];
    }

    plantsToProcess.forEach(plant => {
      const plantTasks = TaskGenerator.generatePlantingTasks(plant, lastFrostDate);
      allTasks = [...allTasks, ...plantTasks];
    });

    return allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error generating all planting tasks:', error);
    return [];
  }
};

/**
 * Gets tasks for a specific month with better filtering
 */
export const getTasksForMonth = async (lastFrostDate, monthIndex) => {
  if (!ValidationUtils.isValidDate(lastFrostDate) || monthIndex < 0 || monthIndex > 11) {
    return [];
  }

  try {
    let allTasks = [];
    const plantSummaries = await loadPlants();

    if (!Array.isArray(plantSummaries)) {
      console.error('TaskService: loadPlants did not return an array. Received:', plantSummaries);
      return [];
    }

    plantSummaries.forEach(summary => {
      // Custom plants have their details inline and don't have a detailsFile
      if (summary.category === 'Custom') {
        const plantTasks = TaskGenerator.generatePlantingTasks(summary, lastFrostDate);
        allTasks.push(...plantTasks);
      } else if (summary.detailsFile) {
        // Standard plants need their details loaded from JSON
        const plantDetails = loadPlantDetails(summary.detailsFile, summary.id.toString());
        if (plantDetails) {
          const plantTasks = TaskGenerator.generatePlantingTasks(plantDetails, lastFrostDate);
          allTasks.push(...plantTasks);
        }
      }
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
 * Enhanced upcoming tasks function with better organization
 */
export const getUpcomingTasksForMyGarden = async (myGarden, lastFrostDate, firstFrostDate, weatherData) => {
  if (!Array.isArray(myGarden)) return [];

  try {
    const allTasks = await getAllUpcomingTasksForMyGarden(myGarden, lastFrostDate, firstFrostDate, weatherData);
    return allTasks;
  } catch (error) {
    console.error('Error generating upcoming tasks:', error);
    return [];
  }
};

/**
 * Enhanced all tasks function with modular task generation
 */
export const getAllUpcomingTasksForMyGarden = async (myGarden, lastFrostDate, firstFrostDate, weatherData) => {
  if (!Array.isArray(myGarden) || myGarden.length === 0) {
    return [];
  }

  try {
    const firstFrost = firstFrostDate ? DateUtils.createDate(firstFrostDate) : null;
    let allTasks = [];
    const allPlants = await loadPlants();
    const wateringPrefs = await getWateringPreferences();

    myGarden.forEach(gardenEntry => {
      if (gardenEntry.status === 'harvested') return;

      let plantDetails;
      // First, find the base plant information from the index.
      const summaryPlant = allPlants.find(p => p.id === gardenEntry.plantId);

      if (gardenEntry.isCustom && gardenEntry.details) {
        // If it's a custom plant, the details are stored on the entry itself.
        plantDetails = gardenEntry.details;
      } else if (summaryPlant && summaryPlant.detailsFile) {
        // If it's a standard plant from the index, load its full details from the corresponding file.
        plantDetails = loadPlantDetails(summaryPlant.detailsFile, summaryPlant.id.toString());
      } else {
        // Fallback or error case
        plantDetails = summaryPlant;
      }

      if (!plantDetails) return;

      let plantSpecificKillDate = null;
      if (weatherData && weatherData.hourlyForecast && !plantDetails.frostTolerant && plantDetails.temperature) {
        const killTemp = plantDetails.temperature.absoluteMinF;
        const killForecast = weatherData.hourlyForecast.find(forecast => {
          const tempF = (forecast.temperature * 9/5) + 32;
          return tempF <= killTemp;
        });
        if (killForecast) {
          plantSpecificKillDate = new Date(killForecast.time);

          // Create Final Harvest Warning
          const warningDate = DateUtils.addDays(plantSpecificKillDate, -4);
          const today = new Date();
          if (warningDate > today) {
            allTasks.push({
              id: `${gardenEntry.id}-final-harvest-warning`,
              plantName: plantDetails.name,
              task: `Final Harvest Warning for ${plantDetails.name}`,
              description: `Freezing temperatures are expected around ${plantSpecificKillDate.toLocaleDateString()}. Harvest any remaining produce before then.`,
              date: warningDate.toISOString(),
              type: TASK_TYPES.CRITICAL,
            });
          }
        }
      }

      if (!plantSpecificKillDate && firstFrost && !plantDetails.frostTolerant) {
        plantSpecificKillDate = firstFrost;
      }


      const plantedDate = new Date(gardenEntry.plantedDate);
      const harvestDate = DateUtils.addDays(plantedDate, plantDetails.daysToMaturity);
      const displayName = gardenEntry.nickname ?
        `${plantDetails.name} (${gardenEntry.nickname})` : plantDetails.name;

      // Generate different types of tasks
      const criticalTasks = TaskGenerator.generateCriticalTasks(
        gardenEntry, plantDetails, harvestDate, firstFrost
      );

      const careTasks = TaskGenerator.generateCareTasks(
        gardenEntry, plantDetails, harvestDate, plantSpecificKillDate, wateringPrefs
      );

      allTasks.push(...criticalTasks, ...careTasks);

      // Add harvest task for single-harvest plants
      if (plantDetails.harvestType === 'single') {
        const harvestTask = {
          id: `${gardenEntry.id}-harvest-${harvestDate.toISOString()}`,
          plantName: displayName,
          task: `🥕 Harvest ${displayName}`,
          description: plantDetails.harvestInstructions,
          date: harvestDate.toISOString(),
          type: TASK_TYPES.HARVEST
        };
        allTasks.push(harvestTask);
      }
    });

    return allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error generating all garden tasks:', error);
    return [];
  }
};

/**
 * Generates seasonal tasks based on frost dates
 */
export const getSeasonalTasks = (lastFrostDate, firstFrostDate) => {
  if (!ValidationUtils.isValidDate(lastFrostDate) || !ValidationUtils.isValidDate(firstFrostDate)) {
    return [];
  }

  try {
    const lastFrost = DateUtils.createDate(lastFrostDate);
    const firstFrost = DateUtils.createDate(firstFrostDate);
    const seasonalTasks = [];

    SEASONAL_TASKS.forEach(task => {
      let taskDate;
      if (task.timing.weeksBeforeLastFrost) {
        taskDate = DateUtils.addDays(lastFrost, -task.timing.weeksBeforeLastFrost * 7);
      } else if (task.timing.weeksAfterFirstFrost) {
        taskDate = DateUtils.addDays(firstFrost, task.timing.weeksAfterFirstFrost * 7);
      }

      if (taskDate) {
        seasonalTasks.push({
          id: `${task.id}-${taskDate.getFullYear()}`,
          task: `🗓️ ${task.name}`,
          description: task.description,
          date: taskDate.toISOString(),
          type: 'seasonal',
        });
      }
    });

    return seasonalTasks;
  } catch (error) {
    console.error('Error generating seasonal tasks:', error);
    return [];
  }
};