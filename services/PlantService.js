import AsyncStorage from '@react-native-async-storage/async-storage';
import fruits from '../data/plants/fruits.json';
import grains from '../data/plants/grains.json';
import herbs from '../data/plants/herbs.json';
import leafy_greens from '../data/plants/leafy_greens.json';
import legumes from '../data/plants/legumes.json';
import root_vegetables from '../data/plants/root_vegetables.json';
import vegetables from '../data/plants/vegetables.json';

const basePlants = [
  ...fruits,
  ...grains,
  ...herbs,
  ...leafy_greens,
  ...legumes,
  ...root_vegetables,
  ...vegetables,
];

let allPlants = [...basePlants];

export const loadPlants = async () => {
  try {
    const customPlantsString = await AsyncStorage.getItem('userCustomPlants');
    const customPlants = customPlantsString ? JSON.parse(customPlantsString) : [];
    // Combine base plants with custom plants, ensuring no duplicates if this function is called multiple times.
    allPlants = [...basePlants, ...customPlants];
    return allPlants;
  } catch (error) {
    console.error('Failed to load custom plants:', error);
    // Return base plants if there's an error
    return basePlants;
  }
};

// Initial load when the service is imported.
loadPlants();

// This function allows other parts of the app to get the currently loaded list of plants.
export const getPlants = () => {
    return allPlants;
};


// Export the array for any components that might still be using the static import.
// This will be updated dynamically by loadPlants.
export default allPlants;
