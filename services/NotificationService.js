// This service handles scheduling and managing push notifications.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Recommended configuration for notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission from the user to send push notifications.
 * @returns {Promise<boolean>} Whether permission was granted.
 */
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permission!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

/**
 * Schedules a single local notification for a specific task.
 * @param {string} identifier - A unique ID for the notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body message of the notification.
 * @param {Date} date - The date and time to trigger the notification.
 */
export const scheduleTaskNotification = async (identifier, title, body, date) => {
    // Ensure the date is in the future
    if (date.getTime() <= Date.now()) {
        console.log(`Skipping notification for ${title} as its date is in the past.`);
        return;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { identifier },
        },
        trigger: date,
        identifier: identifier,
    });
    console.log(`Scheduled notification: ${title} for ${date.toLocaleString()}`);
};

/**
 * Schedules a repeating local notification for a recurring task.
 * @param {string} identifier - A unique ID for the notification.
 * @param {string} title - The title of the notification.
 * @param {string} body - The body message of the notification.
 * @param {Date} startDate - The date and time for the first notification to trigger.
 * @param {number} repeatingDays - The interval in days for the notification to repeat.
 */
export const scheduleRepeatingTaskNotification = async (identifier, title, body, startDate, repeatingDays) => {
    // Ensure the start date is in the future
    if (startDate.getTime() <= Date.now()) {
        console.log(`Skipping repeating notification for ${title} as its start date is in the past.`);
        return;
    }

    const seconds = repeatingDays * 24 * 60 * 60;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { identifier },
        },
        trigger: {
            date: startDate,
            repeats: true,
            seconds: seconds,
        },
        identifier: identifier,
    });

    console.log(`Scheduled repeating notification: ${title} starting from ${startDate.toLocaleString()} every ${repeatingDays} days.`);
};


/**
 * Schedules all notifications for a newly added plant.
 * @param {object} gardenEntry - The entry from the user's garden (contains plantId, plantedDate, etc.).
 * @param {object} plantDetails - The detailed plant object from the static data.
 */
export const scheduleNotificationsForPlant = async (gardenEntry, plantDetails) => {
  const plantedDate = new Date(gardenEntry.plantedDate);
  const harvestDate = new Date(plantedDate);
  harvestDate.setDate(harvestDate.getDate() + plantDetails.daysToMaturity);

  // --- Schedule Recurring Watering Tasks ---
  if (plantDetails.wateringFrequencyDays) {
    const waterDate = new Date(plantedDate);
    const identifier = `${gardenEntry.id}-water-recurring`;
    await scheduleRepeatingTaskNotification(
      identifier,
      '💧 Time to Water!',
      `Your ${plantDetails.name} needs watering.`,
      waterDate,
      plantDetails.wateringFrequencyDays
    );
  }

  // --- Schedule Care Tasks ---
  if (plantDetails.careTasks) {
    plantDetails.careTasks.forEach(async (careTask) => {
      let taskDate = new Date(plantedDate);
      taskDate.setDate(taskDate.getDate() + careTask.daysAfterPlanting);

      if (careTask.recurring) {
        const identifier = `${gardenEntry.id}-${careTask.name}-recurring`;
        await scheduleRepeatingTaskNotification(
          identifier,
          `🔧 Upcoming Task: ${careTask.name}`,
          `It's time to: ${careTask.name} for your ${plantDetails.name}.`,
          taskDate,
          careTask.recurring
        );
      } else if (taskDate <= harvestDate) {
        const identifier = `${gardenEntry.id}-${careTask.name}-${taskDate.toISOString()}`;
        await scheduleTaskNotification(
          identifier,
          `🔧 Upcoming Task: ${careTask.name}`,
          `It's time to: ${careTask.name} for your ${plantDetails.name}.`,
          taskDate
        );
      }
    });
  }

  // --- Schedule Harvest Notification ---
  const harvestIdentifier = `${gardenEntry.id}-harvest-${harvestDate.toISOString()}`;
  await scheduleTaskNotification(
    harvestIdentifier,
    '🥕 Ready for Harvest!',
    `Your ${plantDetails.name} should be ready to harvest.`,
    harvestDate
  );
};


/**
 * Cancels all scheduled notifications that are associated with a specific garden entry ID.
 * @param {string} gardenEntryId - The unique ID of the garden entry.
 */
export const cancelNotificationsForPlant = async (gardenEntryId) => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    let cancelledCount = 0;

    const notificationsToCancel = scheduledNotifications.filter(notif =>
        notif.identifier && notif.identifier.startsWith(gardenEntryId)
    );

    for (const notif of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        cancelledCount++;
    }

    console.log(`Cancelled ${cancelledCount} notifications for plant ID ${gardenEntryId}.`);
};
