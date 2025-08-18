import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.gardencommand';

export const getItem = async (key) => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });

    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`SecureStorage: Failed to get item for key "${key}"`, error);
    throw new Error('Failed to retrieve data from secure storage.');
  }
};

export const setItem = async (key, value) => {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: SERVICE_NAME,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    console.error(`SecureStorage: Failed to set item for key "${key}"`, error);
    throw new Error('Failed to save data to secure storage.');
  }
};

export const removeItem = async (key) => {
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
    });
  } catch (error) {
    console.error(`SecureStorage: Failed to remove item for key "${key}"`, error);
    throw new Error('Failed to remove data from secure storage.');
  }
};