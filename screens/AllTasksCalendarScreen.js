import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUpcomingTasksForMyGarden } from '../services/GardeningService';
import { useFocusEffect } from '@react-navigation/native';

export default function AllTasksCalendarScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const userDataString = await AsyncStorage.getItem('userData');
          const myGardenString = await AsyncStorage.getItem('myGarden');
          
          const myGarden = myGardenString ? JSON.parse(myGardenString) : [];

          if (userDataString) {
            const parsedUserData = JSON.parse(userDataString);
            setUserData(parsedUserData);
            
            if (parsedUserData.lastFrostDate) {
              const allTasks = getAllUpcomingTasksForMyGarden(myGarden, parsedUserData.lastFrostDate);
              const groupedTasks = groupTasksByMonth(allTasks);
              setTasks(groupedTasks);
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

  const groupTasksByMonth = (tasks) => {
    const grouped = {};
    const today = new Date();
    
    // Filter for tasks that are today or in the future
    const futureTasks = tasks.filter(task => new Date(task.date) >= today);

    futureTasks.forEach(task => {
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
      </View>

      {Object.keys(tasks).length > 0 ? (
        Object.keys(tasks).map(month => (
          <View key={month} style={styles.monthSection}>
            <Text style={styles.monthTitle}>{month}</Text>
            {tasks[month].map((item, index) => (
              <View key={index} style={styles.taskCard}>
                <Text style={styles.taskDate}>{formatDate(item.date)}</Text>
                <Text style={styles.taskText}>{item.task}</Text>
              </View>
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
    </ScrollView>
  );
}

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
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});