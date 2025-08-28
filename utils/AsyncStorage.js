import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      try {
        return JSON.parse(jsonValue);
      } catch (e) {
        console.error('Error parsing JSON from async store', e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`AsyncStorage: Failed to get item for key "${key}"`, error);
    throw new Error('Failed to retrieve data from storage.');
  }
};

export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`AsyncStorage: Failed to set item for key "${key}"`, error);
    throw new Error('Failed to save data to storage.');
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`AsyncStorage: Failed to remove item for key "${key}"`, error);
    throw new Error('Failed to remove data from storage.');
  }
};
