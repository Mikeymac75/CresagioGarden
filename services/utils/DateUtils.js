/**
 * Enhanced utility functions
 */
export const DateUtils = {
  /**
   * Creates a date from a string with proper timezone handling
   */
  createDate: (dateString) => {
    // Attempt to parse the date string
    const parsedDate = new Date(dateString);

    // Check if the parsed date is valid
    if (!isNaN(parsedDate.getTime())) {
      // If it's a valid date, we assume it includes a year.
      // We'll set the time to midnight to standardize.
      parsedDate.setHours(0, 0, 0, 0);
      return parsedDate;
    }

    // If parsing fails, it might be in a "Month Day" format (e.g., "May 15")
    // or a format that needs the current year to be valid.
    const withCurrentYear = new Date(`${dateString}, ${new Date().getFullYear()}`);

    if (!isNaN(withCurrentYear.getTime())) {
      withCurrentYear.setHours(0, 0, 0, 0);
      return withCurrentYear;
    }

    // Final fallback for simpler formats, ensuring it's treated as local time
    const constructedDate = new Date(`${new Date().getFullYear()}-${dateString}T00:00:00`);
    if (!isNaN(constructedDate.getTime())) {
      return constructedDate;
    }

    // If all else fails, return an invalid date
    return new Date(NaN);
  },

  /**
   * Adds days to a date and returns a new date
   */
  addDays: (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
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
