import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLANTS } from '../data/plants';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MyGardenScreen({ navigation }) {
  const [myGarden, setMyGarden] = useState([]);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [availablePlants, setAvailablePlants] = useState(PLANTS);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [plantedDate, setPlantedDate] = useState(new Date());

  useFocusEffect(
    React.useCallback(() => {
      loadMyGarden();
    }, [])
  );

  useEffect(() => {
    // Update navigation title with plant count
    const activePlants = myGarden.filter(p => p.status !== 'harvested').length;
    navigation.setOptions({
      title: `My Garden (${activePlants}/10)`
    });
  }, [myGarden, navigation]);

  const loadMyGarden = async () => {
    try {
      const garden = await AsyncStorage.getItem('myGarden');
      if (garden) {
        setMyGarden(JSON.parse(garden));
      }
    } catch (error) {
      console.error('Error loading garden:', error);
    }
  };

  const handleSelectPlant = (plant) => {
    setSelectedPlant(plant);
    setPlantedDate(new Date()); // Reset date for new selection
    setShowDatePicker(Platform.OS === 'ios'); // Show date picker immediately on iOS
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || plantedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setPlantedDate(currentDate);

    if (Platform.OS === 'android') {
      addPlant(selectedPlant, currentDate);
      setSelectedPlant(null);
    }
  };

  const addPlant = async (plant, date) => {
    if (!plant || !date) return;
    if (myGarden.filter(p => p.status !== 'harvested').length >= 10) {
      Alert.alert(
        'Garden Full! 🌱',
        'Free accounts can track up to 10 plants. Upgrade to Pro for unlimited plants!',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Upgrade to Pro', onPress: () => {/* TODO: Upgrade flow */} }
        ]
      );
      return;
    }

    const newPlantEntry = {
      id: Date.now(), // Simple ID for demo
      plantId: plant.id,
      plantName: plant.name,
      plantedDate: date.toISOString(),
      status: 'growing',
      notes: '',
      expectedHarvest: new Date(date.getTime() + (plant.daysToMaturity * 24 * 60 * 60 * 1000)).toISOString()
    };

    const updatedGarden = [...myGarden, newPlantEntry];
    setMyGarden(updatedGarden);
    
    try {
      await AsyncStorage.setItem('myGarden', JSON.stringify(updatedGarden));
      setShowAddPlant(false);
      setSelectedPlant(null);
      Alert.alert('Success!', `${plant.name} added to your garden! 🌱`);
    } catch (error) {
      console.error('Error saving garden:', error);
      Alert.alert('Error', 'Failed to save plant to garden');
    }
  };

  const removePlant = async (plantEntry) => {
    Alert.alert(
      'Remove Plant',
      `Remove ${plantEntry.plantName} from your garden? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            const updatedGarden = myGarden.filter(p => p.id !== plantEntry.id);
            setMyGarden(updatedGarden);
            try {
              await AsyncStorage.setItem('myGarden', JSON.stringify(updatedGarden));
            } catch (error) {
              console.error('Error removing plant:', error);
            }
          }
        }
      ]
    );
  };

  const harvestPlant = async (plantEntry) => {
    Alert.alert(
      'Harvest Plant',
      `Did you harvest your ${plantEntry.plantName}? This will remove it from your active garden.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Harvest', 
          onPress: async () => {
            const updatedGarden = myGarden.map(p => 
              p.id === plantEntry.id ? { ...p, status: 'harvested' } : p
            );
            setMyGarden(updatedGarden);
            try {
              await AsyncStorage.setItem('myGarden', JSON.stringify(updatedGarden));
            } catch (error) {
              console.error('Error harvesting plant:', error);
            }
          }
        }
      ]
    );
  };

  const getPlantInfo = (plantId) => {
    return PLANTS.find(p => p.id === plantId);
  };

  const getDaysUntilHarvest = (expectedHarvest) => {
    const today = new Date();
    const harvest = new Date(expectedHarvest);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderPlantEntry = ({ item }) => {
    const plantInfo = getPlantInfo(item.plantId);
    const daysUntilHarvest = getDaysUntilHarvest(item.expectedHarvest);
    const plantedDate = new Date(item.plantedDate).toLocaleDateString();

    if (item.status === 'harvested') {
      return null;
    }

    return (
      <View style={styles.plantEntry}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{item.plantName}</Text>
          <TouchableOpacity onPress={() => removePlant(item)}>
            <Text style={styles.removeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.plantDetail}>📅 Planted: {plantedDate}</Text>
        <Text style={styles.plantDetail}>
          🌾 Harvest in: {daysUntilHarvest > 0 ? `${daysUntilHarvest} days` : 'Ready!'}
        </Text>
        
        {plantInfo && (
          <Text style={styles.plantTip}>💡 {plantInfo.tips}</Text>
        )}
        
        <View style={styles.plantActions}>
          {plantInfo.harvestType === 'single' && daysUntilHarvest <= 7 && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.harvestButton]}
              onPress={() => harvestPlant(item)}
            >
              <Text style={[styles.actionButtonText, styles.harvestButtonText]}>🥕 Harvest</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📷 Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAvailablePlant = ({ item }) => (
    <TouchableOpacity 
      style={styles.availablePlant}
      onPress={() => handleSelectPlant(item)}
    >
      <Text style={styles.availablePlantName}>{item.name}</Text>
      <Text style={styles.availablePlantCategory}>{item.category}</Text>
      <Text style={styles.availablePlantDays}>{item.daysToMaturity} days</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Your garden is empty! 🌱</Text>
      <Text style={styles.emptyStateText}>
        Add your first plant to start tracking your garden
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => setShowAddPlant(true)}
      >
        <Text style={styles.emptyStateButtonText}>Add Your First Plant</Text>
      </TouchableOpacity>
    </View>
  );

  const activeGarden = myGarden.filter(p => p.status !== 'harvested');

  return (
    <View style={styles.container}>
      <FlatList
        data={activeGarden}
        renderItem={renderPlantEntry}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddPlant(true)}
              disabled={activeGarden.length >= 10}
            >
              <Text style={[
                styles.addButtonText,
                activeGarden.length >= 10 && styles.disabledText
              ]}>
                + Add New Plant
              </Text>
            </TouchableOpacity>
            {activeGarden.length >= 10 && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  🚀 Garden full! Upgrade to Pro for unlimited plants
                </Text>
              </View>
            )}
          </>
        )}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add Plant Modal */}
      <Modal
        visible={showAddPlant}
        animationType="slide"
        presentationStyle="pageSheet"
        onDismiss={() => setSelectedPlant(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Plant to Garden</Text>
            <TouchableOpacity onPress={() => {
              setShowAddPlant(false);
              setSelectedPlant(null);
            }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {selectedPlant && showDatePicker && Platform.OS === 'ios' ? (
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerTitle}>When did you plant {selectedPlant.name}?</Text>
              <DateTimePicker
                testID="dateTimePicker"
                value={plantedDate}
                mode="date"
                is24Hour={true}
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
              <TouchableOpacity
                style={styles.confirmDateButton}
                onPress={() => addPlant(selectedPlant, plantedDate)}
              >
                <Text style={styles.confirmDateButtonText}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={availablePlants}
              renderItem={renderAvailablePlant}
              keyExtractor={item => item.id.toString()}
              style={styles.plantList}
            />
          )}

          {selectedPlant && showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              testID="dateTimePicker"
              value={plantedDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmDateButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmDateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    color: '#a5d6a7',
  },
  limitWarning: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  limitWarningText: {
    color: '#F57C00',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  plantEntry: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  plantDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plantTip: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  plantActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  harvestButton: {
    backgroundColor: '#FF9800',
  },
  harvestButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  plantList: {
    flex: 1,
    padding: 20,
  },
  availablePlant: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  availablePlantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  availablePlantCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  availablePlantDays: {
    fontSize: 12,
    color: '#4CAF50',
  },
});