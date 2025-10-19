// This hook encapsulates the logic for the home screen.
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
  removeItem as removeSecureItem,
} from '../utils/SecureStorage';
import {
  getItem as getAsyncItem,
  setItem as setAsyncItem,
} from '../utils/AsyncStorage';
import { getPlantableNow } from '../services/GardeningService';
import { getUpcomingTasksForMyGarden, getSeasonalTasks } from '../services/TaskService';
import { getWeatherForecast, generateDynamicAlerts } from '../services/WeatherService';
import { loadPlants } from '../services/PlantService';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

const useHomeScreenData = (navigation) => {
  const [userData, setUserData] = useState(null);
  const [plantableNow, setPlantableNow] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setWeatherData(null);
    try {
      const [
        userDataString,
        myGardenString,
        completedTasksString,
        snoozedTasksString,
      ] = await Promise.all([
        getSecureItem('userData'),
        getSecureItem('myGarden'),
        getAsyncItem('completedTasks'),
        getSecureItem('snoozedTasks'),
      ]);

      const myGarden = myGardenString ? JSON.parse(myGardenString) : [];
      setPlantCount(myGarden.filter(p => p.status !== 'harvested').length);

      const loadedCompletedTasks = completedTasksString
        ? new Set(JSON.parse(completedTasksString))
        : new Set();
      setCompletedTasks(loadedCompletedTasks);

      const loadedSnoozedTasks = snoozedTasksString
        ? JSON.parse(snoozedTasksString)
        : {};

      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);

        // Reverse geocode the location
        if (parsedUserData.latitude && parsedUserData.longitude) {
          try {
            const placemarks = await Location.reverseGeocodeAsync({
              latitude: parsedUserData.latitude,
              longitude: parsedUserData.longitude,
            });
            if (placemarks && placemarks.length > 0) {
              const { city, region } = placemarks[0];
              const locationName = city && region ? `${city}, ${region}` : (city || region || '');
              // Update state in a way that triggers a re-render
              setUserData(prevData => ({ ...prevData, locationName }));
            }
          } catch (e) {
            console.error('Reverse geocoding failed', e);
          }
        }

        // Fetch weather data but don't let it block other data fetching.
        let weatherResult = null;
        if (parsedUserData.latitude && parsedUserData.longitude) {
          weatherResult = await getWeatherForecast(parsedUserData.latitude, parsedUserData.longitude);
        }

        const [plantable, rawTasks, seasonal, allPlants] = await Promise.all([
          getPlantableNow(parsedUserData.firstFrostDate),
          getUpcomingTasksForMyGarden(myGarden, parsedUserData.lastFrostDate, parsedUserData.firstFrostDate, weatherResult),
          getSeasonalTasks(parsedUserData.lastFrostDate, parsedUserData.firstFrostDate),
          loadPlants(),
        ]);

        setPlantableNow(plantable);

        let allUpcomingItems = [...rawTasks, ...seasonal];

        // Now handle the weather result
        if (weatherResult && !weatherResult.error) {
          setWeatherData(weatherResult);
          setWeatherError(null); // Clear previous errors
          const alerts = generateDynamicAlerts(weatherResult, myGarden, allPlants);
          allUpcomingItems = [...alerts, ...allUpcomingItems];
        } else {
          setWeatherData(null);
          setWeatherError('Could not load weather data.');
          if (weatherResult) {
            console.error("Weather service failed:", weatherResult.error);
          }
        }

        const tasksWithSnooze = allUpcomingItems.map(task => {
          if (loadedSnoozedTasks[task.id]) {
            return { ...task, date: loadedSnoozedTasks[task.id] };
          }
          return task;
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const twentyEightDaysAgo = new Date(today);
        twentyEightDaysAgo.setDate(today.getDate() - 28);

        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);

        const upcoming = [];
        const overdue = [];

        tasksWithSnooze.forEach(task => {
          if (!task.date || isNaN(new Date(task.date))) {
            console.warn('Skipping task with invalid date:', task);
            return;
          }
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          const isCompleted = loadedCompletedTasks.has(task.id);

          if (taskDate < today) {
            // This is a past task.
            if (isCompleted) {
              // Completed past tasks are not shown.
              return;
            }

            // Uncompleted past task. Apply pruning logic.
            if (task.type === 'water') {
              // Only show uncompleted watering tasks from the last 7 days.
              if (taskDate >= sevenDaysAgo) {
                overdue.push(task);
              }
            } else {
              // Only show other uncompleted tasks from the last 28 days.
              if (taskDate >= twentyEightDaysAgo) {
                overdue.push(task);
              }
            }
          } else if (taskDate < oneWeekFromNow) {
            // Upcoming tasks (today and future) are always shown,
            // the UI will handle the checkmark for completed ones.
            upcoming.push(task);
          }
        });

        setUpcomingTasks(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setOverdueTasks(overdue.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } else {
        // If no user data, the user needs to go through setup.
        console.log('No user data found, redirecting to Setup screen.');
        navigation.replace('Setup');
        return; // Stop further execution in this function
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Could not load your garden data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const snoozeTask = useCallback(async (taskId) => {
    const allCurrentTasks = [...upcomingTasks, ...overdueTasks];
    const task = allCurrentTasks.find(t => t.id === taskId);

    if (!task) {
      console.error('Task to snooze not found in current lists:', taskId);
      await loadData();
      return;
    }

    const snoozedTasksString = await getSecureItem('snoozedTasks');
    const snoozedTasks = snoozedTasksString ? JSON.parse(snoozedTasksString) : {};

    if (task.type === 'water') {
      const newDueDate = new Date();
      newDueDate.setHours(0, 0, 0, 0);
      newDueDate.setDate(newDueDate.getDate() + 1);

      // To correctly check for duplicates, we need the full list of tasks,
      // not just what's currently displayed.
      const [myGardenString, userDataString] = await Promise.all([
        getSecureItem('myGarden'),
        getSecureItem('userData'),
      ]);
      const myGarden = myGardenString ? JSON.parse(myGardenString) : [];
      const userData = JSON.parse(userDataString);

      const [rawTasks, seasonal] = await Promise.all([
        getUpcomingTasksForMyGarden(myGarden, userData.lastFrostDate, userData.firstFrostDate, userData.latitude, userData.longitude),
        getSeasonalTasks(userData.lastFrostDate, userData.firstFrostDate),
      ]);

      const allPossibleTasks = [...rawTasks, ...seasonal];

      const allTasksWithSnooze = allPossibleTasks.map(t => {
        if (snoozedTasks[t.id]) {
          return { ...t, date: snoozedTasks[t.id] };
        }
        return t;
      });

      const isDuplicate = allTasksWithSnooze.some(existingTask => {
        if (existingTask.id === task.id) return false;
        if (existingTask.plantName !== task.plantName || existingTask.type !== 'water') return false;

        const existingTaskDate = new Date(existingTask.date);
        existingTaskDate.setHours(0, 0, 0, 0);

        return existingTaskDate.getTime() === newDueDate.getTime();
      });

      if (isDuplicate) {
        console.log(`Duplicate watering task for ${task.plantName} on ${newDueDate.toISOString()}. Dismissing original task.`);
        // "Dismiss" by marking as complete.
        const completedTasksString = await getAsyncItem('completedTasks');
        const currentCompletedTasks = completedTasksString ? new Set(JSON.parse(completedTasksString)) : new Set();
        currentCompletedTasks.add(task.id);
        await setAsyncItem('completedTasks', JSON.stringify(Array.from(currentCompletedTasks)));

        // If the task was snoozed before, remove it from snoozed list
        if (snoozedTasks[task.id]) {
          delete snoozedTasks[task.id];
          await setSecureItem('snoozedTasks', JSON.stringify(snoozedTasks));
        }

        await loadData();
        return;
      } else {
        // No duplicate, snooze for 1 day.
        snoozedTasks[taskId] = newDueDate.toISOString();
      }
    } else {
      // Not a watering task, keep original 3-day snooze logic.
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 3);
      snoozedTasks[taskId] = newDueDate.toISOString();
    }

    await setSecureItem('snoozedTasks', JSON.stringify(snoozedTasks));
    await loadData();
  }, [loadData, upcomingTasks, overdueTasks]);

  const handleChangeLocation = () => {
    Alert.alert(
      'Change Location',
      'Are you sure you want to change your location? This will require you to set it up again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: async () => {
            try {
              await removeSecureItem('userData');
              navigation.replace('Setup');
            } catch (error) {
              console.error('Failed to remove user data:', error);
              Alert.alert('Error', 'Could not reset location.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleTask = useCallback(async (taskId) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
    await setAsyncItem('completedTasks', JSON.stringify(Array.from(newCompletedTasks)));
  }, [completedTasks]);

  return {
    userData,
    plantableNow,
    upcomingTasks,
    overdueTasks,
    completedTasks,
    plantCount,
    loading,
    weatherData,
    weatherError,
    toggleTask,
    handleChangeLocation,
    loadData,
    snoozeTask,
  };
};

export default useHomeScreenData;
