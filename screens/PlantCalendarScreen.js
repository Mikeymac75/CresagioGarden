import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLANTS, HARDINESS_ZONES } from '../data/plants';

export default function PlantCalendarScreen() {
  const [userData, setUserData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [plantingSchedule, setPlantingSchedule] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      generatePlantingSchedule();
    }
  }, [userData, selectedMonth]);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const generatePlantingSchedule = () => {
    if (!userData || !userData.hardinessZone) return;

    const zone = userData.hardinessZone;
    const zoneData = HARDINESS_ZONES[zone];
    
    if (!zoneData) return;

    // Calculate planting dates based on frost dates
    const lastFrostDate = new Date(zoneData.lastFrostDate);
    const schedule = [];

    PLANTS.forEach(plant => {
      // Calculate planting windows
      const plantingDates = [];

      // Direct sow dates
      if (plant.directSowWeeksAfterLastFrost !== null) {
        const directSowDate = new Date(lastFrostDate);
        directSowDate.setDate(directSowDate.getDate() + (plant.directSowWeeksAfterLastFrost * 7));
        
        if (directSowDate.getMonth() === selectedMonth) {
          plantingDates.push({
            type: 'Direct Sow',
            date: directSowDate,
            method: 'direct sow'
          });
        }
      }

      // Transplant dates
      if (plant.transplantWeeksAfterLastFrost !== null) {
        const transplantDate = new Date(lastFrostDate);
        transplantDate.setDate(transplantDate.getDate() + (plant.transplantWeeksAfterLastFrost * 7));
        
        if (transplantDate.getMonth() === selectedMonth) {
          plantingDates.push({
            type: 'Transplant',
            date: transplantDate,
            method: 'transplant'
          });
        }
      }

      // Start indoors dates
      if (plant.startIndoorsWeeksBefore !== null) {
        const startIndoorsDate = new Date(lastFrostDate);
        startIndoorsDate.setDate(startIndoorsDate.getDate() - (plant.startIndoorsWeeksBefore * 7));
        
        if (startIndoorsDate.getMonth() === selectedMonth) {
          plantingDates.push({
            type: 'Start Indoors',
            date: startIndoorsDate,
            method: 'start indoors'
          });
        }
      }

      plantingDates.forEach(plantingDate => {
        schedule.push({
          plant: plant,
          ...plantingDate
        });
      });
    });

    // Sort by date
    schedule.sort((a, b) => a.date - b.date);
    setPlantingSchedule(schedule);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'direct sow': return '#4CAF50';
      case 'transplant': return '#FF9800';
      case 'start indoors': return '#2196F3';
      default: return '#666';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'direct sow': return '🌱';
      case 'transplant': return '🌿';
      case 'start indoors': return '🏠';
      default: return '📅';
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planting Calendar</Text>
        <Text style={styles.headerSubtitle}>
          Zone {userData.hardinessZone} • {userData.city || userData.zipCode}
        </Text>
      </View>

      {/* Month Selector */}
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

      {/* Calendar Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.monthTitle}>
          {months[selectedMonth]} Planting Guide
        </Text>

        {plantingSchedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No planting activities for {months[selectedMonth]}
            </Text>
            <Text style={styles.emptyStateText}>
              Check other months or try a different growing season!
            </Text>
          </View>
        ) : (
          plantingSchedule.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={styles.scheduleHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.scheduleDate}>
                    {formatDate(item.date)}
                  </Text>
                  <View style={[
                    styles.methodBadge,
                    { backgroundColor: getMethodColor(item.method) }
                  ]}>
                    <Text style={styles.methodText}>
                      {getMethodIcon(item.method)} {item.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.plantName}>{item.plant.name}</Text>
              </View>
              
              <Text style={styles.plantDescription}>
                {item.plant.description}
              </Text>
              
              <View style={styles.plantDetails}>
                <Text style={styles.plantDetail}>
                  🌞 {item.plant.sunRequirement}
                </Text>
                <Text style={styles.plantDetail}>
                  📏 {item.plant.spacing}
                </Text>
                <Text style={styles.plantDetail}>
                  ⏱️ {item.plant.daysToMaturity} days to harvest
                </Text>
              </View>
              
              <Text style={styles.plantTip}>
                💡 {item.plant.tips}
              </Text>
            </View>
          ))
        )}

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>🏠 Start Indoors - Begin seeds inside</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>🌱 Direct Sow - Plant seeds outside</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>🌿 Transplant - Move seedlings outside</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  monthSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
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
    padding: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginTop: 50,
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
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  methodText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  plantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  plantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  plantDetail: {
    fontSize: 12,
    color: '#555',
    marginRight: 15,
    marginBottom: 5,
  },
  plantTip: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    backgroundColor: '#f0f8f0',
    padding: 8,
    borderRadius: 6,
  },
  legend: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
  },
});