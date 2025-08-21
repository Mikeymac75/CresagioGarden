/**
 * Validation utilities
 */
export const ValidationUtils = {
  isValidPostalCode: (code) => {
    if (!code || typeof code !== 'string') return false;
    // US zip code (5 or 9 digits) or Canadian postal code (A1A 1A1 format)
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return usZipRegex.test(code) || canadianPostalRegex.test(code);
  },

  isValidCoordinates: (lat, lon) => {
    return typeof lat === 'number' && typeof lon === 'number' &&
           lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  },

  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
};
