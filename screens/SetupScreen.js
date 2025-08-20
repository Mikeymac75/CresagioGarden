import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { setItem as setSecureItem } from '../utils/SecureStorage';
import * as Location from 'expo-location';
import {
  getWeatherForecast,
  getHardinessZone,
  getFrostDates,
} from '../services/GardeningService';
import { requestNotificationPermissions } from '../services/NotificationService';
import PropTypes from 'prop-types';

export default function SetupScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [zoneInfo, setZoneInfo] = useState(null);

  useEffect(() => {
    const determineZone = async () => {
      setLoading(true);

      // 1. Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location is required to determine your hardiness zone. Please grant permission in your device settings.',
          [{ text: 'OK', onPress: () => setLoading(false) }]
        );
        return;
      }

      try {
        // 2. Get location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // 3. Get weather forecast
        const weather = await getWeatherForecast(latitude, longitude);
        if (weather.error) {
          throw new Error(weather.error);
        }

        // 4. Find min temperature from the forecast
        const minTemp = Math.min(
          ...weather.hourlyForecast.map((h) => h.temperature)
        );

        // 5. Determine hardiness zone
        const hardinessZone = getHardinessZone(minTemp);

        // 6. Get frost dates
        const climateData = getFrostDates(hardinessZone);

        setZoneInfo({
          latitude,
          longitude,
          ...climateData,
        });
      } catch (error) {
        Alert.alert('Error', 'Could not determine your hardiness zone. ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    determineZone();
  }, []);

  const handleContinue = async () => {
    if (!zoneInfo) {
      Alert.alert('Error', 'Could not determine climate data. Please try again.');
      return;
    }

    // Request notification permissions
    await requestNotificationPermissions();

    const userData = {
      ...zoneInfo,
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
          <Text style={styles.cardTitle}>Your Growing Zone</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>
                Determining your hardiness zone based on your location...
              </Text>
            </View>
          ) : zoneInfo ? (
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneText}>
                📍 Hardiness Zone: {zoneInfo.hardinessZone}
              </Text>
              <Text style={styles.zoneDescription}>
                Estimated Last Frost: {zoneInfo.lastFrostDate ? new Date(zoneInfo.lastFrostDate + 'T00:00:00').toLocaleDateString() : 'N/A'}
              </Text>
              <Text style={styles.zoneDescription}>
                Estimated First Frost: {zoneInfo.firstFrostDate ? new Date(zoneInfo.firstFrostDate + 'T00:00:00').toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          ) : (
            <Text style={styles.errorText}>
              Could not determine your zone. Please ensure location services are enabled and try again.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (loading || !zoneInfo) && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading || !zoneInfo}
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
    minHeight: 150,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  },
  errorText: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center'
  },
  zoneInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
  },
  zoneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center'
  },
  zoneDescription: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center'
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