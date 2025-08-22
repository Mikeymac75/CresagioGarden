// Configuration constants
export const CONFIG = {
  SAFETY_BUFFER_DAYS: 14,
  MISSED_TASK_DAYS: 3,
  UPCOMING_TASK_DAYS: 7,
  HEAVY_RAIN_THRESHOLD_MM: 10,
  HEATWAVE_TEMP_CELSIUS: 30,
  HARD_FREEZE_TEMP_CELSIUS: -2,
  USER_AGENT: "GardenCommand/1.0 https://github.com/your-username/garden-command",
  WEATHER_API_BASE_URL: "https://api.met.no/weatherapi/locationforecast/2.0/compact",
  WEATHER_API_TIMEOUT: 15000, // 15 seconds
  WEATHER_API_MAX_RETRIES: 3,
  WEATHER_API_RETRY_DELAY: 1000, // 1 second
};


// Task type constants
export const TASK_TYPES = {
  START_INDOORS: 'start-indoors',
  DIRECT_SOW: 'direct-sow',
  TRANSPLANT: 'transplant',
  WATER: 'water',
  CARE: 'care',
  HARVEST: 'harvest',
  CRITICAL: 'critical',
  ALERT: 'alert'
};

// Alert type constants
export const ALERT_TYPES = {
  HEATWAVE: 'HEATWAVE',
  RAIN: 'RAIN',
  HARD_FREEZE: 'HARD_FREEZE_WARNING'
};
