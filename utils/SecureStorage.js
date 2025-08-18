import * as Keychain from 'react-native-keychain';

/**
 * A secure storage utility for React Native that uses the device's keychain.
 * This provides an abstraction layer over react-native-keychain to handle
 * storing, retrieving, and removing sensitive data as key-value pairs.
 *
 * The service name 'com.gardencommand' is used to group all keychain entries
 * for this specific application, preventing conflicts with other apps.
 */
const SERVICE_NAME = 'com.gardencommand';

/**
 * Retrieves a value from secure storage.
 *
 * @param {string} key - The key of the item to retrieve.
 * @returns {Promise<string|null>} A promise that resolves with the stored value,
 *                                  or null if the item does not exist.
 * @throws {Error} If there is an error retrieving the data.
 */
export const getItem = async (key) => {
  try {
    // Retrieve the generic password for the given service and account (key).
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
      accessGroup: 'group.com.gardencommand', // for icloud keychain sharing
      server: `https://${SERVICE_NAME}`,
      authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    });

    if (credentials) {
      // The value is stored in the 'password' field.
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(`SecureStorage: Failed to get item for key "${key}"`, error);
    // Depending on requirements, you might want to re-throw or handle differently.
    throw new Error('Failed to retrieve data from secure storage.');
  }
};

/**
 * Stores a value securely.
 *
 * @param {string} key - The key for the item to be stored.
 * @param {string} value - The value to store.
 * @returns {Promise<void>} A promise that resolves when the item is stored.
 * @throws {Error} If there is an error storing the data.
 */
export const setItem = async (key, value) => {
  try {
    // Store the value using the key as the 'username' and value as the 'password'.
    await Keychain.setGenericPassword(key, value, {
      service: SERVICE_NAME,
      accessGroup: 'group.com.gardencommand',
      server: `https://${SERVICE_NAME}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
    });
  } catch (error) {
    console.error(`SecureStorage: Failed to set item for key "${key}"`, error);
    throw new Error('Failed to save data to secure storage.');
  }
};

/**
 * Removes a value from secure storage.
 *
 * @param {string} key - The key of the item to remove.
 * @returns {Promise<void>} A promise that resolves when the item is removed.
 * @throws {Error} If there is an error removing the data.
 */
export const removeItem = async (key) => {
  try {
    // Reset the generic password for the given service and account (key).
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
      accessGroup: 'group.com.gardencommand',
      server: `https://${SERVICE_NAME}`,
    });
  } catch (error) {
    console.error(`SecureStorage: Failed to remove item for key "${key}"`, error);
    throw new Error('Failed to remove data from secure storage.');
  }
};
