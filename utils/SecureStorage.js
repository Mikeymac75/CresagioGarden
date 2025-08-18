import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`SecureStorage: Failed to get item for key "${key}"`, error);
    throw new Error('Failed to retrieve data from storage.');
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`SecureStorage: Failed to set item for key "${key}"`, error);
    throw new Error('Failed to save data to storage.');
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`SecureStorage: Failed to remove item for key "${key}"`, error);
    throw new Error('Failed to remove data from storage.');
  }
};