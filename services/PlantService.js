import AsyncStorage from '@react-native-async-storage/async-storage';
import fruits from '../data/plants/fruits.json';
import grains from '../data/plants/grains.json';
import herbs from '../data/plants/herbs.json';
import leafy_greens from '../data/plants/leafy_greens.json';
import legumes from '../data/plants/legumes.json';
import root_vegetables from '../data/plants/root_vegetables.json';
import vegetables from '../data/plants/vegetables.json';
import fruit2 from '../data/plants/fruit2.json';

const basePlants = [
  ...fruits,
  ...fruit2,
  ...grains,
  ...herbs,
  ...leafy_greens,
  ...legumes,
  ...root_vegetables,
  ...vegetables,
];

export const loadPlants = async () => {
  try {
    const customPlantsString = await AsyncStorage.getItem('userCustomPlants');
    const customPlants = customPlantsString ? JSON.parse(customPlantsString) : [];
    return [...basePlants, ...customPlants];
  } catch (error) {
    console.error('Failed to load custom plants:', error);
    // Return base plants if there's an error
    return basePlants;
  }
};

// For any legacy components that might still use a static import.
// This is not ideal, but it's a safe fallback during refactoring.
const PLANTS = [...basePlants];
export default PLANTS;
