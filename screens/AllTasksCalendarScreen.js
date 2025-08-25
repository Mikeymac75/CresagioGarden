import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from 'react-native';
import { getItem as getSecureItem } from '../utils/SecureStorage';
import { getAllUpcomingTasksForMyGarden, getSeasonalTasks, getAllPlantingTasks } from '../services/TaskService';
import { getWeatherForecast, generateDynamicAlerts } from '../services/WeatherService';
import { loadPlants } from '../services/PlantService';
import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';

export default function AllTasksCalendarScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [activeFilters, setActiveFilters] = useState(['water', 'care', 'harvest', 'seasonal', 'alert']);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const filterOptions = {
    'water': '💧',
    'care': '🔧',
    'harvest': '🥕',
    'seasonal': '🗓️',
    'alert': '🔔'
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const [userDataString, myGardenString, seedBankString] = await Promise.all([
            getSecureItem('userData'),
            getSecureItem('myGarden'),
            getSecureItem('userSeedBank'),
          ]);
          const myGarden = myGardenString ? JSON.parse(myGardenString) : [];
          const seedBank = seedBankString ? JSON.parse(seedBankString) : [];

          if (userDataString) {
            const parsedUserData = JSON.parse(userDataString);
            setUserData(parsedUserData);

            if (parsedUserData.location) {
              const weather = await getWeatherForecast(parsedUserData.location.latitude, parsedUserData.location.longitude);
              setWeatherData(weather);

              if (parsedUserData.lastFrostDate) {
                const allPlants = await loadPlants();
                const [fetchedTasks, seasonalTasks, plantingTasks] = await Promise.all([
                  getAllUpcomingTasksForMyGarden(myGarden, parsedUserData.lastFrostDate, parsedUserData.firstFrostDate),
                  getSeasonalTasks(parsedUserData.lastFrostDate, parsedUserData.firstFrostDate),
                  getAllPlantingTasks(parsedUserData.lastFrostDate, seedBank),
                ]);

                const dynamicAlerts = generateDynamicAlerts(weather, myGarden, allPlants);
                const weatherAlerts = weather && weather.alerts ? weather.alerts.map(alert => ({
                  id: `alert-${alert.type}-${new Date().getTime()}`,
                  task: alert.message,
                  date: alert.date,
                  type: 'alert',
                  priority: 'medium',
                  modifiesTasks: alert.modifiesTasks,
                })) : [];

                const allTasks = [...fetchedTasks, ...seasonalTasks, ...dynamicAlerts, ...plantingTasks, ...weatherAlerts];
                setAllTasks(allTasks);
              }
            }
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  useEffect(() => {
    if (!weatherData) {
      const filteredTasks = allTasks.filter(task => activeFilters.includes(task.type));
      const groupedTasks = groupTasksByMonth(filteredTasks);
      setTasks(groupedTasks);
      return;
    }

    const rainAlert = weatherData.alerts.find(a => a.modifiesTasks === 'water');
    const adjustedTasks = allTasks.map(task => {
      if (rainAlert && task.type === 'water') {
        const taskDate = new Date(task.date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (taskDate.toDateString() === today.toDateString() || taskDate.toDateString() === tomorrow.toDateString()) {
          return {
            ...task,
            isCancelled: true,
            task: `~${task.task}~ (Rain expected)`,
          };
        }
      }
      return task;
    });

    const filteredTasks = adjustedTasks.filter(task => activeFilters.includes(task.type));
    const groupedTasks = groupTasksByMonth(filteredTasks);
    setTasks(groupedTasks);
  }, [activeFilters, allTasks, weatherData]);

  const handleFilterChange = (filter) => {
    setActiveFilters(prevFilters => {
      if (prevFilters.includes(filter)) {
        return prevFilters.filter(f => f !== filter);
      } else {
        return [...prevFilters, filter];
      }
    });
  };

  const handleTaskPress = (task) => {
    if (task.description) {
      setSelectedTask(task);
      setIsTaskModalVisible(true);
    }
  };

  const groupTasksByMonth = (tasks) => {
    const grouped = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for tasks that have a date and are today or in the future
    const futureTasks = tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date);
      // Check if taskDate is a valid date
      if (isNaN(taskDate.getTime())) return false;
      return taskDate >= today;
    });

    futureTasks.forEach(task => {
      // We already validated the date in the filter, so we can safely use it here
      const date = new Date(task.date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(task);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
        <Text style={styles.headerTitle}>All Upcoming Tasks</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('PlantingCalendar')}
        >
          <Text style={styles.linkButtonText}>View Planting Calendar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        {Object.entries(filterOptions).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              activeFilters.includes(key) && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange(key)}
          >
            <Text style={styles.filterButtonText}>{value} {key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {Object.keys(tasks).length > 0 ? (
        Object.keys(tasks).map(month => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month}</Text>
            {tasks[month].map((item, index) => (
              <TouchableOpacity key={index} style={styles.taskCard} onPress={() => handleTaskPress(item)} disabled={!item.description}>
                <Text style={styles.taskDate}>{formatDate(item.date)}</Text>
                <Text style={[styles.taskText, item.isCancelled && styles.cancelledTaskText]}>{item.task}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No upcoming tasks found.
          </Text>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTaskModalVisible}
        onRequestClose={() => {
          setIsTaskModalVisible(!isTaskModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedTask?.task}</Text>
            <Text style={styles.modalText}>{selectedTask?.description}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsTaskModalVisible(!isTaskModalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

AllTasksCalendarScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  monthSection: {
    margin: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  taskDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  cancelledTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  linkButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalText: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 16
  }
});