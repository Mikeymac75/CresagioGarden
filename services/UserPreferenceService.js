import { getItem, setItem } from '../utils/SecureStorage';

const PREFERENCES_KEY = 'userWateringPreferences';
const TEMP_UNIT_KEY = 'userTemperatureUnit';
const GARDEN_KEY = 'myGarden';

/**
 * Saves a custom watering frequency for a specific plant instance in the user's garden.
 * @param {string} gardenEntryId - The unique ID of the garden entry.
 * @param {number} customWateringDays - The new watering frequency in days.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const saveWateringPreferenceForPlantInstance = async (gardenEntryId, customWateringDays) => {
  try {
    const gardenString = await getItem(GARDEN_KEY);
    let myGarden = gardenString ? JSON.parse(gardenString) : [];

    const plantIndex = myGarden.findIndex(p => p.id === gardenEntryId);
    if (plantIndex === -1) {
      console.error('Plant instance not found in garden:', gardenEntryId);
      return false;
    }

    myGarden[plantIndex].customWateringDays = customWateringDays;

    await setItem(GARDEN_KEY, JSON.stringify(myGarden));
    return true;
  } catch (error) {
    console.error('Failed to save watering preference for plant instance:', error);
    return false;
  }
};

/**
 * Saves a new default watering frequency for a plant type.
 * @param {string} plantId - The ID of the plant type (e.g., '1' for Tomato).
 * @param {number} customWateringDays - The new default watering frequency.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const saveWateringPreferenceAsDefault = async (plantId, customWateringDays) => {
  try {
    const prefsString = await getItem(PREFERENCES_KEY);
    let preferences = prefsString ? JSON.parse(prefsString) : {};

    preferences[plantId] = { defaultWateringDays: customWateringDays };

    await setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save default watering preference:', error);
    return false;
  }
};

/**
 * Retrieves all user watering preferences.
 * @returns {Promise<object>} - An object containing all watering preferences.
 */
export const getWateringPreferences = async () => {
    try {
        const prefsString = await getItem(PREFERENCES_KEY);
        return prefsString ? JSON.parse(prefsString) : {};
    } catch (error) {
        console.error('Failed to get watering preferences:', error);
        return {};
    }
};

/**
 * Saves the user's preferred temperature unit ('C' or 'F').
 * @param {string} unit - The temperature unit to save ('C' or 'F').
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const saveTemperatureUnit = async (unit) => {
  try {
    if (unit !== 'C' && unit !== 'F') {
      console.error('Invalid temperature unit provided. Must be "C" or "F".');
      return false;
    }
    await setItem(TEMP_UNIT_KEY, unit);
    return true;
  } catch (error) {
    console.error('Failed to save temperature unit:', error);
    return false;
  }
};

/**
 * Retrieves the user's preferred temperature unit.
 * @returns {Promise<string>} - The temperature unit ('C' or 'F'), defaulting to 'C'.
 */
export const getTemperatureUnit = async () => {
  try {
    const unit = await getItem(TEMP_UNIT_KEY);
    return unit === 'F' ? 'F' : 'C'; // Default to 'C' if not set or invalid
  } catch (error) {
    console.error('Failed to get temperature unit:', error);
    return 'C'; // Default to 'C' on error
  }
};
