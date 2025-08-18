import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchClimateData } from '../services/GardeningService';
import { requestNotificationPermissions } from '../services/NotificationService';

export default function SetupScreen({ navigation }) {
  const [postalCode, setPostalCode] = useState('');
  const [climateData, setClimateData] = useState(null);

  useEffect(() => {
    if (postalCode.trim().length >= 3) {
      const data = fetchClimateData(postalCode.trim());
      setClimateData(data);
    } else {
      setClimateData(null);
    }
  }, [postalCode]);

  const handleContinue = async () => {
    if (!climateData) {
      Alert.alert('Error', 'Please enter a valid US Zip Code or Canadian Postal Code.');
      return;
    }

    // Request notification permissions before proceeding
    await requestNotificationPermissions();

    const userData = {
      postalCode,
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to GardenCommand! 🌱</Text>
        <Text style={styles.subtitle}>
          Let's set up your personalized garden assistant.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          <Text style={styles.description}>
            Enter your US Zip Code or Canadian Postal Code.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g., 90210 or K1A 0A9"
            value={postalCode}
            onChangeText={setPostalCode}
            autoCapitalize="characters"
            maxLength={7}
          />

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
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, !climateData && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!climateData}
        >
          <Text style={styles.continueButtonText}>Start Gardening!</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
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