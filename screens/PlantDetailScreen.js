import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color="#4CAF50" style={styles.icon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const PlantDetailScreen = ({ route }) => {
  const { plant, gardenEntry } = route.params;

  const getEstimatedHarvestDate = () => {
    if (!gardenEntry || !plant.daysToMaturity) return 'N/A';
    const planted = new Date(gardenEntry.plantedDate);
    const harvestDate = new Date(planted.setDate(planted.getDate() + plant.daysToMaturity));
    return harvestDate.toLocaleDateString();
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>No plant data provided.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {gardenEntry && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>My {gardenEntry.nickname}</Text>
          <DetailRow
            icon="calendar-outline"
            label="Planted On"
            value={new Date(gardenEntry.plantedDate).toLocaleDateString()}
          />
          <DetailRow
            icon="leaf-outline"
            label="Est. Harvest"
            value={getEstimatedHarvestDate()}
          />
          <Text style={styles.progressLabel}>Progress to Maturity:</Text>
          <ProgressBar
            plantedDate={gardenEntry.plantedDate}
            daysToMaturity={plant.daysToMaturity}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>{plant.name}</Text>
        <Text style={styles.category}>{plant.category}</Text>
        <Text style={styles.description}>{plant.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Growing Information</Text>
        <DetailRow icon="sunny-outline" label="Sun" value={plant.sunRequirement} />
        <DetailRow icon="resize-outline" label="Spacing" value={plant.spacing} />
        <DetailRow icon="leaf-outline" label="Soil Type" value={plant.soil.type} />
        <DetailRow icon="analytics-outline" label="Soil pH" value={plant.soil.ph} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Care Schedule</Text>
        {plant.careTasks && plant.careTasks.map((task, index) => (
          <View key={index} style={styles.taskItem}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  category: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4CAF50',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    marginLeft: 8,
    flexShrink: 1,
    color: '#555',
  },
  taskItem: {
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    paddingLeft: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default PlantDetailScreen;
