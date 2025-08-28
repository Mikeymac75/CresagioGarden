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

const useHomeScreenData = (navigation) => {
  const [userData, setUserData] = useState(null);
  const [plantableNow, setPlantableNow] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

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

        const weatherPromise = (parsedUserData.latitude && parsedUserData.longitude)
          ? getWeatherForecast(parsedUserData.latitude, parsedUserData.longitude)
          : Promise.resolve(null);

        const [weather, plantable, rawTasks, seasonal, allPlants] = await Promise.all([
          weatherPromise,
          getPlantableNow(parsedUserData.firstFrostDate),
          getUpcomingTasksForMyGarden(myGarden, parsedUserData.lastFrostDate, parsedUserData.firstFrostDate, parsedUserData.latitude, parsedUserData.longitude),
          getSeasonalTasks(parsedUserData.lastFrostDate, parsedUserData.firstFrostDate),
          loadPlants(),
        ]);

        if (weather) setWeatherData(weather);
        setPlantableNow(plantable);

        let allUpcomingItems = [...rawTasks, ...seasonal];

        if (weather) {
          const alerts = generateDynamicAlerts(weather, myGarden, allPlants);
          allUpcomingItems = [...alerts, ...allUpcomingItems];
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
    const snoozedTasksString = await getSecureItem('snoozedTasks');
    const snoozedTasks = snoozedTasksString ? JSON.parse(snoozedTasksString) : {};

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 3);
    snoozedTasks[taskId] = newDueDate.toISOString();

    await setSecureItem('snoozedTasks', JSON.stringify(snoozedTasks));
    await loadData();
  }, [loadData]);

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
    toggleTask,
    handleChangeLocation,
    loadData,
    snoozeTask,
  };
};

export default useHomeScreenData;
