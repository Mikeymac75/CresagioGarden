import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPlantableNow,
  getUpcomingTasksForMyGarden,
  getWeatherForecast,
} from '../services/GardeningService';
import { useFocusEffect } from '@react-navigation/native';
import WeatherWidget from '../components/WeatherWidget';

// Simple Checkbox component
const Checkbox = ({ isChecked, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
    {isChecked && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [plantableNow, setPlantableNow] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null); // New state for weather

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        setWeatherData(null); // Reset weather data on focus
        try {
          // Load all data in parallel for speed
          const [userDataString, myGardenString, completedTasksString] = await Promise.all([
            AsyncStorage.getItem('userData'),
            AsyncStorage.getItem('myGarden'),
            AsyncStorage.getItem('completedTasks'),
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

            // Fetch weather data if location is available
            if (parsedUserData.latitude && parsedUserData.longitude) {
              const weather = await getWeatherForecast(
                parsedUserData.latitude,
                parsedUserData.longitude
              );
              setWeatherData(weather);
            }

            if (parsedUserData.firstFrostDate) {
              const plantable = getPlantableNow(
                parsedUserData.firstFrostDate
              );
              setPlantableNow(plantable);
            }

            if (parsedUserData.lastFrostDate) {
              const rawTasks = getUpcomingTasksForMyGarden(
                myGarden,
                parsedUserData.lastFrostDate,
                parsedUserData.firstFrostDate
              );

              // Filter tasks: hide completed tasks from past days
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Set to midnight to compare dates only

              const filteredTasks = rawTasks.filter(task => {
                const taskDate = new Date(task.date);
                taskDate.setHours(0, 0, 0, 0); // Normalize task date as well

                if (taskDate < today) {
                  // It's a past task. Only show it if it's NOT completed.
                  return !loadedCompletedTasks.has(task.id);
                }
                // It's a task for today or the future, always show it.
                return true;
              });

              setUpcomingTasks(filteredTasks);
            }
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const handleChangeLocation = () => {
    Alert.alert(
      'Change Location',
      'Are you sure you want to change your location? This will require you to set it up again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Change',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
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

  const toggleTask = async taskId => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
    // Save the updated set to AsyncStorage
    await AsyncStorage.setItem(
      'completedTasks',
      JSON.stringify(Array.from(newCompletedTasks))
    );
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back! 🌱</Text>
        <TouchableOpacity onLongPress={handleChangeLocation}>
          <Text style={styles.locationText}>
            📍 Zone {userData?.hardinessZone || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>

      <WeatherWidget
        weatherData={weatherData}
        locationAvailable={!!(userData?.latitude && userData?.longitude)}
      />

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{plantCount}/10</Text>
          <Text style={styles.statLabel}>Plants in Garden</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{upcomingTasks.length}</Text>
          <Text style={styles.statLabel}>Tasks This Week</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ This Week's Tasks</Text>
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((item) => {
            const isCompleted = completedTasks.has(item.id);
            return (
              <View key={item.id} style={styles.taskCard}>
                <Checkbox isChecked={isCompleted} onToggle={() => toggleTask(item.id)} />
                <View style={styles.taskDetails}>
                  <Text style={styles.taskDate}>{formatDate(item.date)}</Text>
                  <Text style={[styles.taskText, isCompleted && styles.completedTaskText]}>{item.task}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>You're all caught up!</Text></View>
        )}
      </View>


      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MyGarden')}><Text style={styles.actionButtonText}>🌿 My Garden ({plantCount}/10)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PlantCalendar')}><Text style={styles.actionButtonText}>📅 Planting Guide</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AllTasksCalendar')}><Text style={styles.actionButtonText}>🗓️ All Tasks Calendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('GardenJournal')}><Text style={styles.actionButtonText}>📔 Garden Journal</Text></TouchableOpacity>
      </View>

       <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 What You Can Still Plant</Text>
        {plantableNow.length > 0 ? (
          plantableNow.slice(0, 3).map(plant => (
            <View key={plant.id} style={styles.plantCard}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantTip}>💡 Matures in ~{plant.daysToMaturity} days</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>It's likely too late in the season to plant new crops.</Text></View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    header: { backgroundColor: '#4CAF50', padding: 20, paddingBottom: 40, paddingTop: 50 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    locationText: { fontSize: 16, color: '#E8F5E8' },
    statsCard: { backgroundColor: 'white', marginHorizontal: 20, marginTop: -30, padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-around', elevation: 5 },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
    statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: '#ddd' },
    section: { margin: 20, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    taskCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
    taskDetails: { flex: 1 },
    taskDate: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 },
    taskText: { fontSize: 16, color: '#333' },
    completedTaskText: { textDecorationLine: 'line-through', color: '#aaa' },
    plantCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10 },
    plantName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    plantTip: { fontSize: 12, color: '#2E7D32', fontStyle: 'italic' },
    emptyState: { backgroundColor: 'white', padding: 20, borderRadius: 8, alignItems: 'center' },
    emptyStateText: { fontSize: 16, color: '#666', textAlign: 'center' },
    quickActions: { marginHorizontal: 20 },
    actionButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 10, elevation: 1 },
    actionButtonText: { fontSize: 16, color: '#333', textAlign: 'center', fontWeight: '500' },
    checkboxBase: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 2, borderColor: '#4CAF50', marginRight: 15 },
    checkboxChecked: { backgroundColor: '#4CAF50' },
    checkmark: { color: 'white', fontWeight: 'bold' },
});