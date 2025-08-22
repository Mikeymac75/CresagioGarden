import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

const AvailablePlantListItem = ({ item, onSelect }) => (
  <TouchableOpacity
    style={styles.availablePlant}
    onPress={() => onSelect(item)}
  >
    <Text style={styles.availablePlantName}>
      {item.name} (approx. {item.daysToMaturity} days)
    </Text>
    <Text style={styles.availablePlantCategory}>{item.category}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
});

export default React.memo(AvailablePlantListItem);
