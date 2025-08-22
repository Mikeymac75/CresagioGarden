import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
} from '../utils/SecureStorage';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  validateGardenEntry,
  getDaysUntilHarvest,
} from '../services/GardeningService';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import useSeedBank from '../hooks/useSeedBank';

export default function MyGardenScreen({ navigation }) {
  const [myGarden, setMyGarden] = useState([]);
  const { availablePlants, allPlants } = useSeedBank();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState('list'); // 'list', 'date', 'name'
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantedDate, setPlantedDate] = useState(new Date());
  const [plantNickname, setPlantNickname] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadMyGarden();
    }, [])
  );

  useEffect(() => {
    const activePlants = myGarden.filter(p => p.status !== 'harvested').length;
    navigation.setOptions({
      title: `My Garden (${activePlants}/10)`
    });
  }, [myGarden, navigation]);

  const loadMyGarden = async () => {
    try {
      const garden = await getSecureItem('myGarden');
      setMyGarden(garden ? JSON.parse(garden) : []);
    } catch (error) {
      console.error('Error loading garden:', error);
    }
  };

  const handlePlantSelection = (plant) => {
    setSelectedPlant(plant);
    setPlantedDate(new Date());
    setPlantNickname(plant.name);
    setModalStep('date');
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || plantedDate;
    if (Platform.OS === 'android') {
      setModalStep('name'); // Directly move to the next step
    }
    setPlantedDate(currentDate);
  };
  
  const addPlant = async () => {
    if (myGarden.filter(p => p.status !== 'harvested').length >= 10) {
      Alert.alert('Garden Full!', 'Upgrade to Pro for unlimited plants!');
      return;
    }
    const newPlantEntry = {
      id: Date.now().toString(),
      plantId: selectedPlant.id,
      nickname: plantNickname.trim() || selectedPlant.name,
      plantedDate: plantedDate.toISOString(),
      status: 'active',
    };

    const { isValid, errors } = await validateGardenEntry(newPlantEntry);
    if (!isValid) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    const updatedGarden = [...myGarden, newPlantEntry];
    setMyGarden(updatedGarden);
    try {
      await setSecureItem('myGarden', JSON.stringify(updatedGarden));
      resetAddPlantState();
      Alert.alert('Success!', `${newPlantEntry.nickname} added to your garden! 🌱`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save plant to garden');
    }
  };

  const resetAddPlantState = () => {
    setIsModalVisible(false);
    setSelectedPlant(null);
    setModalStep('list');
    setPlantNickname('');
  };

  const removePlant = async (plantEntry) => {
    Alert.alert('Remove Plant', `Remove ${plantEntry.nickname} from your garden?`,
      [ { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive',
          onPress: async () => {
            const updatedGarden = myGarden.filter(p => p.id !== plantEntry.id);
            setMyGarden(updatedGarden);
            await setSecureItem('myGarden', JSON.stringify(updatedGarden));
          }
        }
      ]
    );
  };

  const renderPlantEntry = ({ item }) => {
    if (item.status === 'harvested') return null;
    const plantInfo = allPlants.find(p => p.id === item.plantId);
    if (!plantInfo) {
      // This can happen if a custom plant was deleted but is still in the garden.
      // Or if the plant list hasn't loaded yet.
      return (
        <View style={styles.plantEntry}>
          <Text style={styles.plantName}>{item.nickname}</Text>
          <Text style={styles.plantDetail}>Plant data not found. It may have been deleted.</Text>
        </View>
      );
    }
    const daysUntilHarvest = getDaysUntilHarvest(
      item.plantedDate,
      plantInfo.daysToMaturity
    );
    return (
      <View style={styles.plantEntry}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{item.nickname}</Text>
          <TouchableOpacity onPress={() => removePlant(item)}>
            <Text style={styles.removeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.plantDetail}>Type: {plantInfo.name}</Text>
        <Text style={styles.plantDetail}>
          📅 Planted: {new Date(item.plantedDate).toLocaleDateString()}
        </Text>
        <Text style={styles.plantDetail}>
          🌾 Harvest in:{' '}
          {daysUntilHarvest > 0 ? `${daysUntilHarvest} days` : 'Ready!'}
        </Text>
      </View>
    );
  };

  const renderAvailablePlant = ({ item }) => (
    <TouchableOpacity
      style={styles.availablePlant}
      onPress={() => handlePlantSelection(item)}
    >
      <Text style={styles.availablePlantName}>
        {item.name} (approx. {item.daysToMaturity} days)
      </Text>
      <Text style={styles.availablePlantCategory}>{item.category}</Text>
    </TouchableOpacity>
  );

  const activeGarden = myGarden.filter(p => p.status !== 'harvested');

  return (
    <View style={styles.container}>
      <FlatList
        data={activeGarden}
        renderItem={renderPlantEntry}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
              disabled={activeGarden.length >= 10}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text
                style={[
                  styles.addButtonText,
                  activeGarden.length >= 10 && styles.disabledText,
                ]}
              >
                Add New Plant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.seedBankButton}
              onPress={() => navigation.navigate('SeedBank')}
            >
              <Ionicons name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.seedBankButtonText}>Manage Seed Bank</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Your garden is empty! 🌱</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>
                Add Your First Plant
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetAddPlantState}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalStep === 'list' ? 'Choose a Plant' : 'Confirm Details'}
            </Text>
            <TouchableOpacity onPress={resetAddPlantState}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {modalStep === 'list' && (
            <>
              <TouchableOpacity
                style={styles.createCustomButton}
                onPress={() => {
                  resetAddPlantState();
                  navigation.navigate('CustomPlant');
                }}
              >
                <Text style={styles.createCustomButtonText}>
                  + Create a Custom Plant
                </Text>
              </TouchableOpacity>
              <FlatList
                data={availablePlants}
                renderItem={renderAvailablePlant}
                keyExtractor={item => item.id.toString()}
                style={styles.plantList}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    No seeds in your bank.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyListButton}
                    onPress={() => {
                      resetAddPlantState();
                      navigation.navigate('SeedBank');
                    }}
                  >
                    <Text style={styles.emptyListButtonText}>
                      Go to Seed Bank
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            </>
          )}

          {modalStep === 'date' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                When did you plant {selectedPlant?.name}?
              </Text>
              <DateTimePicker
                value={plantedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setModalStep('name')}
              >
                <Text style={styles.confirmButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {modalStep === 'name' && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Give your plant a nickname</Text>
              <TextInput
                style={styles.input}
                value={plantNickname}
                onChangeText={setPlantNickname}
                placeholder="e.g., Patio Tomatoes"
              />
              <TouchableOpacity style={styles.confirmButton} onPress={addPlant}>
                <Text style={styles.confirmButtonText}>Add to Garden</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

MyGardenScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  headerButtons: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  seedBankButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  seedBankButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledText: { color: '#a5d6a7' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
    elevation: 3,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  removeButton: { fontSize: 18, color: '#ff4444' },
  plantDetail: { fontSize: 14, color: '#666', marginBottom: 4 },
  modalContainer: { flex: 1, backgroundColor: '#f9f9f9' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalClose: { fontSize: 24, color: '#666' },
  plantList: { flex: 1, padding: 10 },
  availablePlant: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  availablePlantName: { fontSize: 16, fontWeight: 'bold' },
  availablePlantCategory: { fontSize: 14, color: '#666' },
  createCustomButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  createCustomButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyListButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyListButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});