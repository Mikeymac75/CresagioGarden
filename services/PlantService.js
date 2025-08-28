import AsyncStorage from '@react-native-async-storage/async-storage';
import plantIndex from '../assets/plant_index.json';

// A map to handle dynamic loading of plant data JSON files.
// Metro bundler requires static paths for imports.
const plantDataFiles = {
  'vegetables.json': () => require('../data/plants/vegetables.json'),
  'fruits.json': () => require('../data/plants/fruits.json'),
  'fruit2.json': () => require('../data/plants/fruit2.json'),
  'fruit3.json': () => require('../data/plants/fruit3.json'),
  'grains.json': () => require('../data/plants/grains.json'),
  'herbs.json': () => require('../data/plants/herbs.json'),
  'herbs2.json': () => require('../data/plants/herbs2.json'),
  'leafy_greens.json': () => require('../data/plants/leafy_greens.json'),
  'leafy_greens2.json': () => require('../data/plants/leafy_greens2.json'),
  'legumes.json': () => require('../data/plants/legumes.json'),
  'root_vegetables.json': () => require('../data/plants/root_vegetables.json'),
  'root_vegetables2.json': () => require('../data/plants/root_vegetables2.json'),
  'flowers.json': () => require('../data/plants/flowers.json'),
};

// A map for the corresponding FAQ files.
const plantFaqFiles = {
  'vegetables_faq.json': () => require('../data/plants/vegetables_faq.json'),
  'fruits_faq.json': () => require('../data/plants/fruits_faq.json'),
  'fruit2_faq.json': () => require('../data/plants/fruit2_faq.json'),
  'fruit3_faq.json': () => require('../data/plants/fruit3_faq.json'),
  'grains_faq.json': () => require('../data/plants/grains_faq.json'),
  'herbs_faq.json': () => require('../data/plants/herbs_faq.json'),
  'herbs2_faq.json': () => require('../data/plants/herbs2_faq.json'),
  'leafy_greens_faq.json': () => require('../data/plants/leafy_greens_faq.json'),
  'leafy_greens2_faq.json': () => require('../data/plants/leafy_greens2_faq.json'),
  'legumes_faq.json': () => require('../data/plants/legumes_faq.json'),
  'root_vegetables_faq.json': () => require('../data/plants/root_vegetables_faq.json'),
  'root_vegetables2_faq.json': () => require('../data/plants/root_vegetables2_faq.json'),
  'flowers_faq.json': () => require('../data/plants/flowers_faq.json'),
};

const basePlants = plantIndex;

export const loadPlants = async () => {
  try {
    const customPlantsString = await AsyncStorage.getItem('userCustomPlants');
    const customPlants = customPlantsString ? JSON.parse(customPlantsString) : [];
    return [...basePlants, ...customPlants];
  } catch (error) {
    console.error('Failed to load custom plants:', error);
    return basePlants;
  }
};

/**
 * Loads the detailed information for a specific plant.
 * @param {string} detailsFile - The JSON file where the plant details are stored.
 * @param {string} plantId - The unique identifier for the plant (e.g., '1').
 * @returns {object | null} The detailed plant object or null if not found.
 */
export const loadPlantDetails = (detailsFile, plantId) => {
  if (!plantDataFiles[detailsFile]) {
    console.error(`Details file not found: ${detailsFile}`);
    return null;
  }
  const allDetails = plantDataFiles[detailsFile]();
  const numericId = parseInt(plantId, 10);
  return allDetails.find(p => p.id === numericId) || null;
};

/**
 * Loads the FAQ for a specific plant.
 * @param {string} faqFile - The JSON file where the plant FAQs are stored.
 * @param {string} plantId - The unique identifier for the plant (e.g., '1').
 * @returns {Array | null} An array of Q&A objects or null if not found.
 */
export const loadPlantFaq = (faqFile, plantId) => {
  if (!plantFaqFiles[faqFile]) {
    console.error(`FAQ file not found: ${faqFile}`);
    return null;
  }
  const allFaqs = plantFaqFiles[faqFile]();
  return allFaqs[plantId] || null;
};

// For any legacy components that might still use a static import.
// This is not ideal, but it's a safe fallback during refactoring.
const PLANTS = [...basePlants];
export default PLANTS;
