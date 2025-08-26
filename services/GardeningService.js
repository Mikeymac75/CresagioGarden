import { loadPlants } from './PlantService';
import { gardenEntrySchema, weatherSchema } from '../utils/validationSchemas';

import { TASK_TYPES, ALERT_TYPES, CONFIG } from './constants';

import { DateUtils } from './utils/DateUtils';

import { ValidationUtils } from './utils/ValidationUtils';

export const getHardinessZoneByLatitude = (latitude) => {
  // Simplified mapping of latitude to hardiness zone for the Northern Hemisphere
  const lat = Math.abs(latitude); // Use absolute value for simplicity
  if (lat >= 45) return '4b';
  if (lat >= 40) return '5b';
  if (lat >= 35) return '6b';
  if (lat >= 30) return '7b';
  if (lat >= 25) return '8b';
  return '9b'; // Default for lower latitudes
};

export const getFrostDates = (hardinessZone) => {
    const year = new Date().getFullYear();
    // Simplified mapping of hardiness zones to frost dates
    const frostDates = {
        '1': { last: `05-28`, first: `08-28` },
        '2': { last: `05-18`, first: `09-04` },
        '3': { last: `05-08`, first: `09-11` },
        '4': { last: `05-03`, first: `09-29` },
        '5': { last: `04-18`, first: `10-17` },
        '6': { last: `04-11`, first: `10-24` },
        '7': { last: `03-28`, first: `11-07` },
        '8': { last: `03-20`, first: `11-17` },
        '9': { last: `02-17`, first: `12-04` },
        '10': { last: `01-08`, first: `12-23` },
        '11': { last: null, first: null },
        '12': { last: null, first: null },
        '13': { last: null, first: null },
    };

    const zone = hardinessZone.slice(0, hardinessZone.length -1);
    const dates = frostDates[zone];

    if (!dates || !dates.last) {
        return { lastFrostDate: null, firstFrostDate: null, success: true, hardinessZone: hardinessZone };
    }

    return {
        hardinessZone: hardinessZone,
        lastFrostDate: `${year}-${dates.last}`,
        firstFrostDate: `${year}-${dates.first}`,
        success: true,
    };
};


/**
 * Enhanced public API functions
 */

/**
 * Enhanced plantable now function with better safety margins
 */
export const getPlantableNow = async (firstFrostDate) => {
  if (!ValidationUtils.isValidDate(firstFrostDate)) {
    return [];
  }

  try {
    const today = new Date();
    const firstFrost = DateUtils.createDate(firstFrostDate);
    const allPlants = await loadPlants();

    return allPlants.filter(plant => {
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
 * New utility functions for better service integration
 */

/**
 * Gets garden statistics
 */
export const getGardenStatistics = async (myGarden) => {
  if (!Array.isArray(myGarden)) return null;

  try {
    const allPlants = await loadPlants();
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
      const plantDetails = allPlants.find(p => p.id === entry.plantId);
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
    const allPlants = await loadPlants();
    const plantExists = allPlants.find(p => p.id === entry.plantId);
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
export const getDaysUntilHarvest = (plantedDate, plantInfo) => {
  if (!ValidationUtils.isValidDate(plantedDate) || !plantInfo || !plantInfo.daysToMaturity) {
    return null;
  }
  const { daysToMaturity, harvestType, harvestPeriodDays } = plantInfo;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const harvestDate = DateUtils.addDays(new Date(plantedDate), daysToMaturity);
  harvestDate.setHours(0, 0, 0, 0);

  if (harvestType === 'continuous' && harvestPeriodDays) {
    const harvestEndDate = DateUtils.addDays(harvestDate, harvestPeriodDays);
    harvestEndDate.setHours(0, 0, 0, 0);

    if (today >= harvestDate && today <= harvestEndDate) {
      return "Harvesting Now";
    }
    if (today > harvestEndDate) {
      return "Finished";
    }
  }

  const daysRemaining = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
      return "Ready!";
  }

  return `${daysRemaining} days`;
};


export { TASK_TYPES, ALERT_TYPES, CONFIG };