import { DateUtils } from './utils/DateUtils';
import { ValidationUtils } from './utils/ValidationUtils';
import PLANTS from '../data/free_plants.json';
import { TASK_TYPES, CONFIG } from './constants';

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
        const isWateringTask = careTask.name.toLowerCase() === 'watering';
        const taskType = isWateringTask ? TASK_TYPES.WATER : TASK_TYPES.CARE;
        const taskEmoji = isWateringTask ? '💧' : '🔧';
        const baseTaskDescription = careTask.name.replace(plantDetails.name, '').trim();

        if (careTask.recurring) {
          while (taskDate <= harvestDate) {
            if (TaskGenerator.shouldSkipTask(taskDate, firstFrost, plantDetails.frostTolerant)) {
              break;
            }

            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `${taskEmoji} ${baseTaskDescription} ${displayName}`,
              date: taskDate.toISOString(),
              type: taskType
            });

            taskDate = DateUtils.addDays(taskDate, careTask.recurring);
          }
        } else if (taskDate <= harvestDate) {
          if (!TaskGenerator.shouldSkipTask(taskDate, firstFrost, plantDetails.frostTolerant)) {
            tasks.push({
              id: `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`,
              plantName: displayName,
              task: `${taskEmoji} ${baseTaskDescription} for ${displayName}`,
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
   * Helper to determine if a task should be skipped due to frost
   */
  shouldSkipTask: (taskDate, firstFrost, isFrostTolerant) => {
    return firstFrost && !isFrostTolerant && taskDate > firstFrost;
  }
};

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

      // Add harvest task
      const harvestTask = {
        id: `${gardenEntry.id}-harvest-${harvestDate.toISOString()}`,
        plantName: displayName,
        task: `🥕 Harvest ${displayName}`,
        date: harvestDate.toISOString(),
        type: TASK_TYPES.HARVEST
      };

      allTasks.push(...criticalTasks, ...careTasks, harvestTask);
    });

    return allTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error generating all garden tasks:', error);
    return [];
  }
};
