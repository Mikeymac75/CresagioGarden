import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { fetchClimateData } from '../services/GardeningService';

export default function SetupScreen({ navigation }) {
  const [pin, setPin] = useState({
    latitude: 45.4215, // Default to Ottawa
    longitude: -75.6972,
  });
  const [climateData, setClimateData] = useState(null);

  const handleMapPress = (e) => {
    const location = e.nativeEvent.coordinate;
    setPin(location);
    const data = fetchClimateData(location);
    setClimateData(data);
  };

  const handleContinue = async () => {
    if (!climateData) {
      Alert.alert('Set Location', 'Please drop a pin on your garden location first.');
      return;
    }

    const userData = {
      ...pin,
      ...climateData,
      setupComplete: true
    };

    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to save location data');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to GardenCommand! 🌱</Text>
        <Text style={styles.subtitle}>
          To create your personalized schedule, drop a pin on your garden.
        </Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          ...pin,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={pin} title="My Garden" description="Your selected location" />
      </MapView>
      
      {climateData && (
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneText}>
            📍 Hardiness Zone: {climateData.hardinessZone}
          </Text>
          <Text style={styles.zoneDescription}>
            Last Frost: {new Date(climateData.lastFrostDate + 'T00:00:00').toLocaleDateString()}
          </Text>
          <Text style={styles.zoneDescription}>
            First Frost: {new Date(climateData.firstFrostDate + 'T00:00:00').toLocaleDateString()}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.continueButton, !climateData && styles.disabledButton]} 
        onPress={handleContinue}
        disabled={!climateData}
      >
        <Text style={styles.continueButtonText}>Start Gardening!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  map: {
    width: Dimensions.get('window').width,
    flex: 1,
  },
  zoneInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  zoneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  zoneDescription: {
    fontSize: 14,
    color: '#4CAF50',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});