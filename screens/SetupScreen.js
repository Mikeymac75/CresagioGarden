import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { setItem as setSecureItem } from '../utils/SecureStorage';
import * as Location from 'expo-location';
import {
  getHardinessZoneByLatitude,
  getFrostDates,
} from '../services/GardeningService';
import { requestNotificationPermissions } from '../services/NotificationService';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';

const HARDINESS_ZONES_LIST = [
  '1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b',
  '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b', '11a', '11b', '12a', '12b'
];

export default function SetupScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [zoneInfo, setZoneInfo] = useState(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  useEffect(() => {
    const determineZone = async () => {
      setLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location is required to automatically determine your hardiness zone. Please set it manually.',
          [{ text: 'OK' }]
        );
        // Default to a common zone and show the picker
        const climateData = getFrostDates('5b');
        setZoneInfo({ ...climateData });
        setIsPickerVisible(true);
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const hardinessZone = getHardinessZoneByLatitude(latitude);
        const climateData = getFrostDates(hardinessZone);

        setZoneInfo({
          latitude,
          longitude,
          ...climateData,
        });
      } catch (error) {
        Alert.alert('Error', 'Could not determine your location. ' + error.message);
        const climateData = getFrostDates('5b');
        setZoneInfo({ ...climateData });
      } finally {
        setLoading(false);
      }
    };

    determineZone();
  }, []);

  const handleZoneChange = (newZone) => {
    const newClimateData = getFrostDates(newZone);
    setZoneInfo(prevInfo => ({
      ...prevInfo,
      ...newClimateData,
    }));
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
    }
  };

  const handleContinue = async () => {
    if (!zoneInfo) {
      Alert.alert('Error', 'Could not determine climate data. Please try again.');
      return;
    }

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
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : zoneInfo ? (
            <>
              <View style={styles.zoneDisplay}>
                <Text style={styles.zoneText}>
                  📍 Zone: {zoneInfo.hardinessZone}
                </Text>
                <TouchableOpacity onPress={() => setIsPickerVisible(!isPickerVisible)}>
                  <Text style={styles.changeButtonText}>
                    {isPickerVisible ? 'Done' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>
              {!isPickerVisible && (
                 <View style={styles.frostInfo}>
                    <Text style={styles.zoneDescription}>
                      Last Frost: {zoneInfo.lastFrostDate ? new Date(zoneInfo.lastFrostDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'N/A'}
                    </Text>
                    <Text style={styles.zoneDescription}>
                      First Frost: {zoneInfo.firstFrostDate ? new Date(zoneInfo.firstFrostDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'N/A'}
                    </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>
              Could not determine your zone. Please set it manually.
            </Text>
          )}

          {isPickerVisible && (
            <Picker
              selectedValue={zoneInfo.hardinessZone}
              onValueChange={(itemValue) => handleZoneChange(itemValue)}
            >
              {HARDINESS_ZONES_LIST.map(zone => (
                <Picker.Item key={zone} label={zone} value={zone} />
              ))}
            </Picker>
          )}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading}
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center'
  },
  zoneDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
  },
  zoneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  changeButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  frostInfo: {
    marginTop: 10,
    alignItems: 'center',
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