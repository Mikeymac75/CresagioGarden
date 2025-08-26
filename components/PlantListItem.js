import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PlantListItem = ({ item, isSelected, onToggle, onDelete, onPress }) => {
  const isCustom = item.category === 'Custom';

  return (
    <View style={styles.plantItemContainer}>
      <TouchableOpacity
        style={[styles.plantItem, isSelected && styles.plantItemSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>
            {item.name} (approx. {item.daysToMaturity} days)
          </Text>
          <Text style={styles.plantCategory}>{item.category}</Text>
        </View>
        <TouchableOpacity onPress={onToggle} style={styles.checkboxTouchable}>
          <Ionicons
            name={isSelected ? 'checkbox' : 'square-outline'}
            size={24}
            color={isSelected ? '#4CAF50' : '#ccc'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
      {isCustom && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  plantItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  plantItemSelected: {
    borderLeftColor: '#4CAF50',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 8,
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
  checkboxTouchable: {
    padding: 8,
  },
});

export default React.memo(PlantListItem);
