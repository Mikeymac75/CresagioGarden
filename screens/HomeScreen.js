import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlantableNow } from '../services/GardeningService';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [plantableNow, setPlantableNow] = useState([]);
  const [plantCount, setPlantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // useFocusEffect will refetch data every time the screen comes into view
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const data = await AsyncStorage.getItem('userData');
          if (data) {
            const parsed = JSON.parse(data);
            setUserData(parsed);
            
            if (parsed.firstFrostDate) {
              const plantable = getPlantableNow(parsed.firstFrostDate);
              setPlantableNow(plantable);
            }
          }

          const myGarden = await AsyncStorage.getItem('myGarden');
          if (myGarden) {
            const plants = JSON.parse(myGarden);
            setPlantCount(plants.length);
          } else {
            setPlantCount(0);
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

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Could not load user data.</Text>
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
          📍 Zone {userData.hardinessZone}
        </Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{plantCount}/10</Text>
          <Text style={styles.statLabel}>Plants in Garden</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{plantableNow.length}</Text>
          <Text style={styles.statLabel}>Plantable Now</Text>
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
        <Text style={styles.sectionTitle}>✅ What You Can Plant Now</Text>
        {plantableNow.length > 0 ? (
          plantableNow.map(plant => (
            <View key={plant.id} style={styles.plantCard}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantDescription}>{plant.description}</Text>
              <Text style={styles.plantTip}>💡 Matures in ~{plant.daysToMaturity} days</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              It's likely too late in the season to plant new crops. Time to plan for next year!
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingBottom: 30,
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
    marginHorizontal: 20,
    marginTop: -20, // Pulls the card up into the header
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
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
  },
  upgradeCard: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    marginTop: 20,
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
    marginTop: 10,
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
    shadowOpacity: 0.05,
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
    marginBottom: 8,
  },
  plantTip: {
    fontSize: 12,
    color: '#2E7D32',
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});