import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomPlantScreen({ navigation }) {
  const [name, setName] = useState('');
  const [daysToMaturity, setDaysToMaturity] = useState('');
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !daysToMaturity.trim() || !wateringFrequencyDays.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const maturity = parseInt(daysToMaturity, 10);
    const frequency = parseInt(wateringFrequencyDays, 10);

    if (isNaN(maturity) || isNaN(frequency) || maturity <= 0 || frequency <= 0) {
      Alert.alert('Error', 'Please enter valid numbers for maturity and watering days.');
      return;
    }

    const newPlant = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: 'Custom',
      daysToMaturity: maturity,
      wateringFrequencyDays: frequency,
      careTasks: [
        {
          name: 'Watering',
          description: `Water your ${name.trim()} consistently. Provide about 1-2 inches of water per week, adjusting for rainfall.`,
          daysAfterPlanting: 0,
          recurring: frequency,
        },
      ],
      // Add other default properties to match the main plant structure if needed
      harvestType: 'single',
      spacing: 'N/A',
      sunRequirement: 'Full sun',
      startIndoorsWeeksBefore: null,
      transplantWeeksAfterLastFrost: null,
      directSowWeeksAfterLastFrost: null,
      wateringNeeds: 'Consistent moisture',
      frostTolerant: false,
      description: 'A custom plant added by you.',
      tips: 'Keep an eye on your custom plant and learn its needs as you grow!',
    };

    try {
      const existingPlantsString = await AsyncStorage.getItem('userCustomPlants');
      const existingPlants = existingPlantsString ? JSON.parse(existingPlantsString) : [];
      const updatedPlants = [...existingPlants, newPlant];
      await AsyncStorage.setItem('userCustomPlants', JSON.stringify(updatedPlants));

      Alert.alert('Success', 'Plant saved! It will be available next time you open the app.');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save custom plant:', error);
      Alert.alert('Error', 'Could not save the plant. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Create a Custom Plant</Text>
        <Text style={styles.label}>Plant Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., My Special Tomatoes"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Days to Maturity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 60"
          value={daysToMaturity}
          onChangeText={setDaysToMaturity}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Watering Frequency (in days)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 3"
          value={wateringFrequencyDays}
          onChangeText={setWateringFrequencyDays}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Plant</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
