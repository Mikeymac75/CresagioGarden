import React, { useState } from 'react';
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

export default function SetupScreen({ navigation }) {
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);

  // Simple hardiness zone mapping based on zip codes (simplified for MVP)
  const getHardinessZone = (zip) => {
    const firstDigit = parseInt(zip.charAt(0));
    const secondDigit = parseInt(zip.charAt(1));
    
    // Rough US hardiness zone mapping
    if (firstDigit === 0) return 3; // Northern states
    if (firstDigit === 1) return 4;
    if (firstDigit === 2) return 5;
    if (firstDigit === 3) return 6;
    if (firstDigit === 4) return 7;
    if (firstDigit === 5) return 7;
    if (firstDigit === 6) return 8;
    if (firstDigit === 7) return 8;
    if (firstDigit === 8) return 9;
    if (firstDigit === 9) return 10;
    
    return 6; // Default middle zone
  };

  const handleContinue = async () => {
    if (!zipCode || zipCode.length < 5) {
      Alert.alert('Error', 'Please enter a valid zip code');
      return;
    }

    const zone = getHardinessZone(zipCode);
    const userData = {
      zipCode,
      city,
      state,
      hardinessZone: zone,
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
          Let's set up your personalized garden assistant
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          <Text style={styles.description}>
            We'll use this to create your custom planting calendar
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Zip Code (12345)"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            maxLength={5}
          />

          <TextInput
            style={styles.input}
            placeholder="City (optional)"
            value={city}
            onChangeText={setCity}
          />

          <TextInput
            style={styles.input}
            placeholder="State (optional)"
            value={state}
            onChangeText={setState}
          />

          {zipCode.length >= 5 && (
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneText}>
                📍 Hardiness Zone: {getHardinessZone(zipCode)}
              </Text>
              <Text style={styles.zoneDescription}>
                This determines your frost dates and planting schedule
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Start Gardening!</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What you'll get:</Text>
          <Text style={styles.feature}>🗓️ Personalized planting calendar</Text>
          <Text style={styles.feature}>🌿 Track up to 10 plants (Free)</Text>
          <Text style={styles.feature}>📔 Garden journal with photos</Text>
          <Text style={styles.feature}>💡 Expert growing tips</Text>
        </View>
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
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 5,
  },
});