import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { setItem as setSecureItem } from '../utils/SecureStorage';
import * as Location from 'expo-location';
import { fetchClimateData, REGIONS } from '../services/GardeningService';
import { requestNotificationPermissions } from '../services/NotificationService';
import PropTypes from 'prop-types';

export default function SetupScreen({ navigation }) {
  const [selectedRegion, setSelectedRegion] = useState(Object.keys(REGIONS)[0]);
  const [climateData, setClimateData] = useState(null);

  useEffect(() => {
    if (selectedRegion && REGIONS[selectedRegion]) {
      const data = fetchClimateData(selectedRegion);
      setClimateData(data);
    } else {
      setClimateData(null);
    }
  }, [selectedRegion]);

  const handleContinue = async () => {
    if (!climateData || !climateData.success) {
      Alert.alert('Error', 'Please select a valid region.');
      return;
    }

    // Request location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    let locationData = {};
    if (status === 'granted') {
      try {
        let location = await Location.getCurrentPositionAsync({});
        locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (error) {
         Alert.alert(
           'Location Error',
           'Could not fetch location. Weather features will be disabled. You can grant permission in your device settings later.'
         );
      }
    } else {
       Alert.alert(
        'Permission Denied',
        'You have not granted location permissions. Weather features will be disabled. You can grant permission in your device settings later.'
      );
    }

    // Request notification permissions
    await requestNotificationPermissions();

    const userData = {
      region: selectedRegion,
      ...climateData,
      ...locationData, // Add lat/lon here, will be empty if permission denied
      setupComplete: true,
    };

    try {
      await setSecureItem('userData', JSON.stringify(userData));
      navigation.replace('MainApp', { screen: 'Home' });
    } catch (error) {
      Alert.alert('Error', 'Failed to save user data');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to GardenCommand! 🌱</Text>
        <Text style={styles.subtitle}>
          Let's set up your personalized garden assistant.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          <Text style={styles.description}>
            Select your growing region from the list below.
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRegion}
              onValueChange={(itemValue) => setSelectedRegion(itemValue)}
              style={styles.picker}
            >
              {Object.keys(REGIONS).map((regionName) => (
                <Picker.Item label={regionName} value={regionName} key={regionName} />
              ))}
            </Picker>
          </View>

          {climateData && climateData.success && (
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
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, (!climateData || !climateData.success) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!climateData || !climateData.success}
        >
          <Text style={styles.continueButtonText}>Start Gardening!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

SetupScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  zoneInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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