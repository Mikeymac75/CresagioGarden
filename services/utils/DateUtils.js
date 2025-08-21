/**
 * Enhanced utility functions
 */
export const DateUtils = {
  /**
   * Creates a date from a string with proper timezone handling
   */
  createDate: (dateString) => {
    return new Date(`${dateString}T00:00:00`);
  },

  /**
   * Adds days to a date and returns a new date
   */
  addDays: (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  },

  /**
   * Gets the start and end of a date range
   */
  getDateRange: (fromDate, days) => {
    const endDate = DateUtils.addDays(fromDate, days);
    return { start: fromDate, end: endDate };
  },

  /**
   * Checks if a date is within a range
   */
  isDateInRange: (date, startDate, endDate) => {
    return date >= startDate && date <= endDate;
  }
};
