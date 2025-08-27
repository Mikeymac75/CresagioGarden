import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AvailablePlantListItem = ({ item, onSelect, onPressDetails }) => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => onSelect(item)}
    activeOpacity={0.6}
  >
    <View style={styles.infoContainer}>
      <Text style={styles.name}>
        {item.name} (approx. {item.daysToMaturity} days)
      </Text>
      <Text style={styles.category}>{item.category}</Text>
    </View>
    <TouchableOpacity onPress={() => onPressDetails(item)} style={styles.iconButton}>
      <Ionicons name="information-circle-outline" size={24} color="#007bff" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  iconButton: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
});

export default React.memo(AvailablePlantListItem);
