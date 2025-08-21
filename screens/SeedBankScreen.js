import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSeedBank from '../hooks/useSeedBank';

export default function SeedBankScreen() {
  const { seedBank, allPlants, isLoading, toggleSeedInBank } = useSeedBank();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = useMemo(() => {
    if (!searchQuery) {
      return allPlants;
    }
    return allPlants.filter(plant =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allPlants]);

  const renderPlantItem = ({ item }) => {
    const isSelected = seedBank.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.plantItem, isSelected && styles.plantItemSelected]}
        onPress={() => toggleSeedInBank(item.id)}
      >
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantCategory}>{item.category}</Text>
        </View>
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? '#4CAF50' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

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
  plantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  plantItemSelected: {
    borderLeftColor: '#4CAF50',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  plantCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
