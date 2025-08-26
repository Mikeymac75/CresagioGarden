// This hook encapsulates the logic for the home screen.
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
  removeItem as removeSecureItem,
} from '../utils/SecureStorage';
import { getPlantableNow } from '../services/GardeningService';
import { getUpcomingTasksForMyGarden, getSeasonalTasks } from '../services/TaskService';
import { getWeatherForecast, generateDynamicAlerts } from '../services/WeatherService';
import { loadPlants } from '../services/PlantService';
import { useFocusEffect } from '@react-navigation/native';

const useHomeScreenData = (navigation) => {
  const [userData, setUserData] = useState(null);
  const [plantableNow, setPlantableNow] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setWeatherData(null);
    try {
      const [userDataString, myGardenString, completedTasksString] = await Promise.all([
        getSecureItem('userData'),
        getSecureItem('myGarden'),
        getSecureItem('completedTasks'),
      ]);

      const myGarden = myGardenString ? JSON.parse(myGardenString) : [];
      setPlantCount(myGarden.filter(p => p.status !== 'harvested').length);

      const loadedCompletedTasks = completedTasksString
        ? new Set(JSON.parse(completedTasksString))
        : new Set();
      setCompletedTasks(loadedCompletedTasks);

      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        setUserData(parsedUserData);

        const weatherPromise = (parsedUserData.latitude && parsedUserData.longitude)
          ? getWeatherForecast(parsedUserData.latitude, parsedUserData.longitude)
          : Promise.resolve(null);

        const [weather, plantable, rawTasks, seasonal, allPlants] = await Promise.all([
          weatherPromise,
          getPlantableNow(parsedUserData.firstFrostDate),
          getUpcomingTasksForMyGarden(myGarden, parsedUserData.lastFrostDate, parsedUserData.firstFrostDate),
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rangeStart = new Date();
        rangeStart.setDate(today.getDate() - 3);
        rangeStart.setHours(0, 0, 0, 0);

        const wateringPastLimit = new Date();
        wateringPastLimit.setDate(today.getDate() - 7);
        wateringPastLimit.setHours(0, 0, 0, 0);

        const filteredAndSortedTasks = allUpcomingItems
          .filter(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            const isCompleted = loadedCompletedTasks.has(task.id);

            if (taskDate >= today) {
              return true;
            }

            if (isCompleted) {
              return false;
            } else {
              if (task.type === 'water') {
                return taskDate >= wateringPastLimit;
              } else {
                return taskDate >= rangeStart;
              }
            }
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setUpcomingTasks(filteredAndSortedTasks);
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
    await setSecureItem('completedTasks', JSON.stringify(Array.from(newCompletedTasks)));
  }, [completedTasks]);

  return {
    userData,
    plantableNow,
    upcomingTasks,
    completedTasks,
    plantCount,
    loading,
    weatherData,
    toggleTask,
    handleChangeLocation,
    loadData,
  };
};

export default useHomeScreenData;
