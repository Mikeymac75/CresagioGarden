import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItem as getSecureItem, setItem as setSecureItem } from '../utils/SecureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWateringPreferences, getTemperatureUnit, saveTemperatureUnit } from '../services/UserPreferenceService';

const SettingsScreen = ({ navigation }) => {
  const [tempUnit, setTempUnit] = useState('C');

  useEffect(() => {
    const fetchTempUnit = async () => {
      const unit = await getTemperatureUnit();
      setTempUnit(unit);
    };
    fetchTempUnit();
  }, []);

  const handleSetTempUnit = async (unit) => {
    await saveTemperatureUnit(unit);
    setTempUnit(unit);
  };

  const handleBackup = async () => {
    try {
        const myGardenString = await getSecureItem('myGarden');
        const customPlantsString = await AsyncStorage.getItem('userCustomPlants');
        const wateringPrefs = await getWateringPreferences();

        const backupData = {
            myGarden: myGardenString ? JSON.parse(myGardenString) : [],
            userCustomPlants: customPlantsString ? JSON.parse(customPlantsString) : [],
            wateringPreferences: wateringPrefs,
            backupDate: new Date().toISOString(),
        };

        Alert.alert(
            'Backup Simulation',
            'In a real app, this data would be encrypted and uploaded to your cloud service. Here is the data that would be backed up:',
            [
                {
                    text: 'Copy to Clipboard', // A bit more useful than just OK
                    onPress: () => {
                        // In a real app, you might use a clipboard library
                        console.log(JSON.stringify(backupData, null, 2));
                        Alert.alert('Copied!', 'Backup data copied to console/clipboard.');
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    } catch (error) {
        Alert.alert('Error', 'Could not generate backup data.');
        console.error('Backup error:', error);
    }
  };

  const handleRestore = async () => {
    // In a real app, you'd prompt the user to select a file from their cloud storage.
    // For this simulation, we'll just imagine they selected the most recent backup.
    // To make the simulation work, we'll create a "backup" from the current state.
    const getSimulatedBackup = async () => {
        const myGardenString = await getSecureItem('myGarden');
        const customPlantsString = await AsyncStorage.getItem('userCustomPlants');
        const wateringPrefs = await getWateringPreferences();
        return {
            myGarden: myGardenString ? JSON.parse(myGardenString) : [],
            userCustomPlants: customPlantsString ? JSON.parse(customPlantsString) : [],
            wateringPreferences: wateringPrefs,
            backupDate: new Date().toISOString(),
        };
    };

    const backupData = await getSimulatedBackup();

    Alert.alert(
        'Restore from Backup',
        `This will overwrite all your current garden data with the data from the backup dated ${new Date(backupData.backupDate).toLocaleString()}. Are you sure?`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Restore',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await setSecureItem('myGarden', JSON.stringify(backupData.myGarden || []));
                        await AsyncStorage.setItem('userCustomPlants', JSON.stringify(backupData.userCustomPlants || []));
                        await setSecureItem('userWateringPreferences', JSON.stringify(backupData.wateringPreferences || {}));

                        Alert.alert(
                            'Restore Complete',
                            'Your data has been restored. Please restart the app for changes to take full effect.'
                        );
                    } catch (error) {
                        Alert.alert('Error', 'Failed to restore data.');
                        console.error('Restore error:', error);
                    }
                },
            },
        ]
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases', 'Contacting the App Store... Premium status successfully restored!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          <Ionicons name="thermometer-outline" size={24} color="#4CAF50" />
          <Text style={styles.rowText}>Temperature Unit</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segmentButton, tempUnit === 'C' && styles.segmentButtonActive]}
              onPress={() => handleSetTempUnit('C')}
            >
              <Text style={[styles.segmentButtonText, tempUnit === 'C' && styles.segmentButtonTextActive]}>°C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, tempUnit === 'F' && styles.segmentButtonActive]}
              onPress={() => handleSetTempUnit('F')}
            >
              <Text style={[styles.segmentButtonText, tempUnit === 'F' && styles.segmentButtonTextActive]}>°F</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup & Restore</Text>
        <TouchableOpacity style={styles.row} onPress={handleBackup}>
          <Ionicons name="cloud-upload-outline" size={24} color="#4CAF50" />
          <Text style={styles.rowText}>Backup My Garden</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleRestore}>
          <Ionicons name="cloud-download-outline" size={24} color="#4CAF50" />
          <Text style={styles.rowText}>Restore from Backup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleRestorePurchases}>
          <Ionicons name="receipt-outline" size={24} color="#4CAF50" />
          <Text style={styles.rowText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      {/* Developer Tools Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer Tools</Text>
        <TouchableOpacity style={styles.row} onPress={async () => {
          try {
            const isPremium = await AsyncStorage.getItem('isPremium');
            const newStatus = isPremium === 'true' ? 'false' : 'true';
            await AsyncStorage.setItem('isPremium', newStatus);
            Alert.alert('Dev Tool', `Premium status set to: ${newStatus}`);
          } catch (e) {
            Alert.alert('Error', 'Failed to toggle premium status.');
          }
        }}>
          <Ionicons name="bug-outline" size={24} color="#4CAF50" />
          <Text style={styles.rowText}>Toggle Premium (Dev)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4CAF50',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  segmentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  segmentButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  segmentButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
