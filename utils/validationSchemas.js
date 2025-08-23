import * as yup from 'yup';

// Schema for a single care task
const careTaskSchema = yup.object().shape({
  name: yup.string().required(),
  daysAfterPlanting: yup.number().required().min(0),
  recurring: yup.number().nullable().min(1),
});

// Schema for conditional alerts
const conditionalAlertSchema = yup.object().shape({
  condition: yup.string().required(),
  message: yup.string().required(),
});

// Schema for critical tasks
const criticalTaskSchema = yup.object().shape({
    condition: yup.string().required(),
    daysAfterPlanting: yup.number().required().min(0),
    task: yup.string().required(),
});

// Schema for a single plant
const plantSchema = yup.object().shape({
  id: yup.mixed().required(),
  name: yup.string().required(),
  category: yup.string().required(),
  harvestType: yup.string().oneOf(['continuous', 'single']).required(),
  daysToMaturity: yup.number().required().min(0),
  spacing: yup.string().required(),
  sunRequirement: yup.string().required(),
  startIndoorsWeeksBefore: yup.number().nullable().min(0),
  transplantWeeksAfterLastFrost: yup.number().nullable(),
  directSowWeeksAfterLastFrost: yup.number().nullable(),
  wateringNeeds: yup.string().required(),
  wateringFrequencyDays: yup.number().required().min(1),
  // --- THE FIX: Corrected 'yp' to 'yup' ---
  description: yup.string().required(),
  // --- END FIX ---
  tips: yup.string().required(),
  careTasks: yup.array().of(careTaskSchema),
  conditionalAlerts: yup.array().of(conditionalAlertSchema),
  criticalTasks: yup.array().of(criticalTaskSchema),
});

// Schema for the entire PLANTS array
export const plantsArraySchema = yup.array().of(plantSchema);

// Schema for a single hardiness zone
const hardinessZoneSchema = yup.object().shape({
  lastFrostDate: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).required(),
  firstFrostDate: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).required(),
});

// Schema for the HARDINESS_ZONES object
export const hardinessZonesSchema = yup.object().test(
  'is-dictionary-of-zones',
  'HARDINESS_ZONES must be an object with numeric keys',
  (value) => {
    if (!value) return true; // Allow empty object
    for (const key in value) {
      if (isNaN(Number(key))) {
        return false;
      }
    }
    return true;
  }
);


// Schema for a garden entry
export const gardenEntrySchema = yup.object().shape({
  id: yup.string().required(),
  plantId: yup.mixed().required(),
  plantedDate: yup.string().required(),
  nickname: yup.string().transform(value => value ? value.trim() : value),
  status: yup.string().oneOf(['active', 'harvested']).optional(),
});

// Schema for weather data from the API
export const weatherSchema = yup.object().shape({
    properties: yup.object().shape({
      timeseries: yup.array().of(
        yup.object().shape({
          time: yup.string().required(),
          data: yup.object().shape({
            instant: yup.object().shape({
              details: yup.object().shape({
                air_temperature: yup.number().required(),
              }).required(),
            }).required(),
            next_1_hours: yup.object().shape({
              summary: yup.object().shape({
                symbol_code: yup.string(),
              }),
              details: yup.object().shape({
                precipitation_amount: yup.number(),
              }),
            }),
          }).required(),
        })
      ).min(1, "Timeseries data cannot be empty").required(),
    }).required(),
  });