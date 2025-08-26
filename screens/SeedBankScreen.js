import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import useSeedBank from '../hooks/useSeedBank';
import PlantListItem from '../components/PlantListItem';
import { useNavigation } from '@react-navigation/native';

export default function SeedBankScreen() {
  const { seedBank, allPlants, isLoading, toggleSeedInBank, loadSeedBank } = useSeedBank();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  // --- NEW FEATURE: Delete custom plant ---
  const deleteCustomPlant = async (plantId) => {
    Alert.alert(
      'Delete Custom Plant',
      'Are you sure you want to permanently delete this plant? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const existingPlantsString = await AsyncStorage.getItem('userCustomPlants');
              let existingPlants = existingPlantsString ? JSON.parse(existingPlantsString) : [];
              existingPlants = existingPlants.filter(p => p.id !== plantId);
              await AsyncStorage.setItem('userCustomPlants', JSON.stringify(existingPlants));
              
              // Also remove it from the seed bank if it's there
              const newSeedBank = new Set(seedBank);
              if (newSeedBank.has(plantId)) {
                newSeedBank.delete(plantId);
                await setSecureItem('userSeedBank', JSON.stringify([...newSeedBank]));
              }

              // Refresh the plant list
              loadSeedBank();
              Alert.alert('Success', 'Custom plant has been deleted.');
            } catch (error) {
              console.error('Failed to delete custom plant:', error);
              Alert.alert('Error', 'Could not delete the plant.');
            }
          },
        },
      ]
    );
  };
  // --- END FEATURE ---

  const filteredPlants = useMemo(() => {
    if (!searchQuery) {
      return allPlants;
    }
    return allPlants.filter(plant =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allPlants]);

  const renderPlantItem = useCallback(({ item }) => {
    const isSelected = seedBank.has(item.id);
    return (
      <PlantListItem
        item={item}
        isSelected={isSelected}
        onToggle={() => toggleSeedInBank(item.id)}
        onDelete={() => deleteCustomPlant(item.id)}
        onPress={() => navigation.navigate('PlantDetail', { plant: item })}
      />
    );
  }, [seedBank, toggleSeedInBank, deleteCustomPlant, navigation]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Seed Bank</Text>
        <Text style={styles.subtitle}>
          Select the seeds you own to make them available for planting in your
          garden.
        </Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a plant..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <FlatList
        data={filteredPlants}
        renderItem={renderPlantItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    padding: 10,
  },
});