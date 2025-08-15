import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasksForMonth } from '../services/GardeningService';

export default function PlantCalendarScreen() {
  const [userData, setUserData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [plantingSchedule, setPlantingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const loadAndGenerate = async () => {
      setLoading(true);
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const parsedData = JSON.parse(data);
          setUserData(parsedData);
          if (parsedData.lastFrostDate) {
            const tasks = getTasksForMonth(parsedData.lastFrostDate, selectedMonth);
            setPlantingSchedule(tasks);
          }
        }
      } catch (error) {
        console.error('Error in calendar screen:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAndGenerate();
  }, [selectedMonth]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMethodInfo = (type) => {
    switch (type) {
      case 'direct-sow': return { color: '#4CAF50', icon: '🌿', label: 'Direct Sow' };
      case 'transplant': return { color: '#FF9800', icon: '🏡', label: 'Transplant' };
      case 'start-indoors': return { color: '#2196F3', icon: '🌱', label: 'Start Indoors' };
      default: return { color: '#666', icon: '📅', label: 'Task' };
    }
  };

  if (!userData) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planting Calendar</Text>
        <Text style={styles.headerSubtitle}>
          Zone {userData.hardinessZone}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.monthSelector}
        contentContainerStyle={styles.monthSelectorContent}
      >
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthButton,
              selectedMonth === index && styles.selectedMonthButton
            ]}
            onPress={() => setSelectedMonth(index)}
          >
            <Text style={[
              styles.monthButtonText,
              selectedMonth === index && styles.selectedMonthButtonText
            ]}>
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <Text style={styles.monthTitle}>
          {months[selectedMonth]} Planting Guide
        </Text>

        {loading ? (
           <ActivityIndicator size="large" color="#4CAF50" />
        ) : plantingSchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No major planting activities for {months[selectedMonth]}
            </Text>
            <Text style={styles.emptyStateText}>
              Check other months, especially in the spring!
            </Text>
          </View>
        ) : (
          plantingSchedule.map((item, index) => {
            const methodInfo = getMethodInfo(item.type);
            return (
              <View key={index} style={styles.scheduleItem}>
                <View style={[styles.dateContainer, { backgroundColor: methodInfo.color }]}>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.plantName}>{item.plantName}</Text>
                  <Text style={styles.taskDescription}>{item.task}</Text>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  monthSelector: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexGrow: 0,
  },
  monthSelectorContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedMonthButton: {
    backgroundColor: '#4CAF50',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedMonthButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scheduleItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfo: {
    padding: 15,
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
  },
});