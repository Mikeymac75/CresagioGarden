import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const getItem = async (key) => {
  try {
    let jsonValue;
    if (Platform.OS === 'web') {
      jsonValue = await AsyncStorage.getItem(key);
    } else {
      jsonValue = await SecureStore.getItemAsync(key);
    }
    if (jsonValue !== null) {
      try {
        return JSON.parse(jsonValue);
      } catch (e) {
        console.error('Error parsing JSON from secure store', e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`SecureStorage: Failed to get item for key "${key}"`, error);
    throw new Error('Failed to retrieve data from storage.');
  }
};

export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, jsonValue);
    } else {
      await SecureStore.setItemAsync(key, jsonValue);
    }
  } catch (error) {
    console.error(`SecureStorage: Failed to set item for key "${key}"`, error);
    throw new Error('Failed to save data to storage.');
  }
};

export const removeItem = async (key) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`SecureStorage: Failed to remove item for key "${key}"`, error);
    throw new Error('Failed to remove data from storage.');
  }
};