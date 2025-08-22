import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDaysUntilHarvest } from '../services/GardeningService';

const GardenPlantListItem = ({ item, plantInfo, onRemove }) => {
  if (!plantInfo) {
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
        <TouchableOpacity onPress={() => onRemove(item)}>
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

const styles = StyleSheet.create({
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
});

export default React.memo(GardenPlantListItem);
