// src/utils/scheduleGenerator.js

/**
 * Adds a specified number of days to a given date.
 * @param {Date} date - The starting date.
 * @param {number} days - The number of days to add.
 * @returns {Date} The new date.
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates a complete list of tasks for a plant based on its planting date.
 * @param {object} plant - The plant object from plants.js.
 * @param {Date} plantingDate - The date the plant was added to the garden.
 * @returns {Array<object>} An array of task objects.
 */
export function generateScheduleForPlant(plant, plantingDate) {
  const allTasks = [];
  const maturityDate = addDays(plantingDate, plant.daysToMaturity);

  // --- 1. Generate Tasks from the careTasks array ---
  // This is the part that was likely already working.
  if (plant.careTasks && plant.careTasks.length > 0) {
    plant.careTasks.forEach(taskTemplate => {
      const taskDate = addDays(plantingDate, taskTemplate.daysAfterPlanting);
      
      // Only add tasks that occur before the plant matures
      if (taskDate <= maturityDate) {
        allTasks.push({
          plantName: plant.name,
          taskName: taskTemplate.name,
          date: taskDate,
          recurringDays: taskTemplate.recurring,
          isComplete: false,
        });
      }
    });
  }

  // --- 2. THE FIX: Generate recurring watering tasks ---
  // This is the new logic that was missing.
  if (plant.wateringFrequencyDays > 0) {
    // Create a single recurring task that starts on the planting date
    allTasks.push({
      plantName: plant.name,
      taskName: `Water ${plant.name}`,
      date: new Date(plantingDate), // Starts today
      recurringDays: plant.wateringFrequencyDays,
      isComplete: false,
    });
  }

  return allTasks;
}