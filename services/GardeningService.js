import { PLANTS, HARDINESS_ZONES } from '../data/plants';

/**
 * A mock function to simulate fetching precise climate data from a backend API.
 * In a real app, this would make a network request with latitude/longitude.
 * For the MVP, we'll use the hardcoded data but pretend it's dynamic.
 * @param {object} location - An object with latitude and longitude.
 * @returns {object} An object with hardinessZone, lastFrostDate, and firstFrostDate.
 */
export const fetchClimateData = (location) => {
  // This is where you'd call a weather/climate API.
  // For now, we'll just assign a default zone's data for demonstration.
  // We'll use Zone 5 as a default, but a real implementation would be more complex.
  const zone = 5; // Placeholder
  const zoneData = HARDINESS_ZONES[zone];

  return {
    hardinessZone: zone,
    lastFrostDate: zoneData.lastFrostDate, // e.g., '2024-04-15'
    firstFrostDate: zoneData.firstFrostDate, // e.g., '2024-10-15'
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

  // Task: Start Indoors
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

  // Task: Direct Sow
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

  // Task: Transplant
  if (plant.transplantWeeksAfterLastFrost != null) {
    const date = new Date(lastFrost);
    date.setDate(date.getDate() + plant.transplantWeeksAfterLastFrost * 7);
    tasks.push({
      plantName: plant.name,
      task: `🏡 Transplant ${plant.name} seedlings outside`,
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
  
  // Sort tasks by date
  monthTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return monthTasks;
};

/**
 * Determines which plants can still be safely planted today to mature before the first frost.
 * @param {string} firstFrostDate - The user's first fall frost date (YYYY-MM-DD).
 * @returns {array} A list of plant objects that are safe to plant.
 */
export const getPlantableNow = (firstFrostDate) => {
  const today = new Date();
  const firstFrost = new Date(`${firstFrostDate}T00:00:00`);
  const safetyBuffer = 14; // 2-week buffer before frost

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
 * **-- NEW FUNCTION --**
 * Generates and filters tasks for the user's specific garden for the upcoming week.
 * @param {array} myGarden - The user's garden array from AsyncStorage.
 * @param {string} lastFrostDate - The user's last spring frost date (YYYY-MM-DD).
 * @returns {array} A sorted list of tasks for the next 7 days.
 */
export const getUpcomingTasksForMyGarden = (myGarden, lastFrostDate) => {
  if (!myGarden || myGarden.length === 0) {
    return [];
  }

  let allTasks = [];
  myGarden.forEach(gardenEntry => {
    const plantDetails = PLANTS.find(p => p.id === gardenEntry.plantId);
    if (plantDetails) {
      // We only care about tasks relevant to plants already planted, like care/harvest.
      // For this MVP, we will simulate a "Watering" task.
      const plantedDate = new Date(gardenEntry.plantedDate);

      // Add a recurring "Water" task every 3 days for demonstration
      for (let i = 0; i < plantDetails.daysToMaturity; i += 3) {
        const waterDate = new Date(plantedDate);
        waterDate.setDate(waterDate.getDate() + i);
        allTasks.push({
          plantName: plantDetails.name,
          task: `💧 Water ${plantDetails.name}`,
          date: waterDate.toISOString(),
          type: 'care'
        });
      }
    }
  });

  // Filter for tasks in the next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingTasks = allTasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= today && taskDate <= nextWeek;
  });

  // Sort tasks by date
  upcomingTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcomingTasks;
};