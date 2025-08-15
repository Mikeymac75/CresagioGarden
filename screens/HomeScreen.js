import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLANTS, HARDINESS_ZONES } from '../data/plants';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [currentWeekPlants, setCurrentWeekPlants] = useState([]);
  const [plantCount, setPlantCount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadPlantCount();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUserData(parsed);
        calculateCurrentWeekPlants(parsed.hardinessZone);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPlantCount = async () => {
    try {
      const myGarden = await AsyncStorage.getItem('myGarden');
      if (myGarden) {
        const plants = JSON.parse(myGarden);
        setPlantCount(plants.length);
      }
    } catch (error) {
      console.error('Error loading plant count:', error);
    }
  };

  const calculateCurrentWeekPlants = (zone) => {
    // Simple calculation for what to plant this week
    // In a real app, this would be more sophisticated
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    let recommendations = [];
    
    if (currentMonth >= 3 && currentMonth <= 5) { // Spring
      recommendations = PLANTS.filter(plant => 
        plant.directSowWeeksAfterLastFrost <= 2 || plant.transplantWeeksAfterLastFrost <= 2
      ).slice(0, 3);
    } else if (currentMonth >= 6 && currentMonth <= 8) { // Summer
      recommendations = PLANTS.filter(plant => 
        plant.name.includes('Bean') || plant.name.includes('Cucumber') || plant.name === 'Basil'
      ).slice(0, 3);
    } else if (currentMonth >= 9 && currentMonth <= 11) { // Fall
      recommendations = PLANTS.filter(plant => 
        plant.category === 'Leafy Green' || plant.name === 'Radishes'
      ).slice(0, 3);
    } else { // Winter
      recommendations = []; // Plan for next season
    }
    
    setCurrentWeekPlants(recommendations);
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back! 🌱
        </Text>
        <Text style={styles.locationText}>
          📍 Zone {userData.hardinessZone} • {userData.city || userData.zipCode}
        </Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{plantCount}/10</Text>
          <Text style={styles.statLabel}>Plants in Garden</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentWeekPlants.length}</Text>
          <Text style={styles.statLabel}>Recommended This Week</Text>
        </View>
      </View>

      {plantCount >= 10 && (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>🚀 Upgrade to Pro</Text>
          <Text style={styles.upgradeText}>
            Add unlimited plants, get weather alerts, and unlock advanced features!
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗓️ What to Plant This Week</Text>
        {currentWeekPlants.length > 0 ? (
          currentWeekPlants.map(plant => (
            <View key={plant.id} style={styles.plantCard}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantDescription}>{plant.description}</Text>
              <Text style={styles.plantTip}>💡 {plant.tips}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No planting recommendations for this week. Check back later!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyGarden')}
        >
          <Text style={styles.actionButtonText}>🌿 My Garden ({plantCount}/10)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('PlantCalendar')}
        >
          <Text style={styles.actionButtonText}>📅 Planting Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('GardenJournal')}
        >
          <Text style={styles.actionButtonText}>📔 Garden Journal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#E8F5E8',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 20,
  },
  upgradeCard: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 5,
  },
  upgradeText: {
    fontSize: 14,
    color: '#BF360C',
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  plantCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  plantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  plantTip: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});