import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import { loadPlantDetails, loadPlantFaq } from '../services/PlantService';
import { saveWateringPreferenceForPlantInstance, saveWateringPreferenceAsDefault } from '../services/UserPreferenceService';
import AdjustWateringModal from '../components/AdjustWateringModal';

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={20} color="#4CAF50" style={styles.icon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const FaqSection = ({ faqData }) => {
  if (!faqData || faqData.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      {faqData.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </View>
      ))}
    </View>
  );
};

const PlantDetailScreen = ({ route }) => {
  const { plant: initialPlant, gardenEntry, plantId, detailsFile, faqFile, name } = route.params;

  const [plant, setPlant] = useState(initialPlant);
  const [faqData, setFaqData] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialPlant);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGardenEntry, setCurrentGardenEntry] = useState(gardenEntry);

  useEffect(() => {
    // If the plant object from route params is a summary, fetch full details
    if (initialPlant && initialPlant.detailsFile && initialPlant.id) {
      setIsLoading(true);
      const fullDetails = loadPlantDetails(initialPlant.detailsFile, initialPlant.id.toString());
      if (fullDetails) {
        setPlant(fullDetails); // Overwrite summary with full details
        if (initialPlant.faqFile) {
            const faqs = loadPlantFaq(initialPlant.faqFile, initialPlant.id.toString());
            setFaqData(faqs);
        }
      }
      setIsLoading(false);
    } else if (!initialPlant && plantId && detailsFile) {
        // Fallback for when details are passed as separate params
        setIsLoading(true);
        const details = loadPlantDetails(detailsFile, plantId.toString());
        if (details) {
            setPlant(details);
        } else {
            console.error("Could not load plant details for ID:", plantId);
        }

        if (faqFile) {
            const faqs = loadPlantFaq(faqFile, plantId.toString());
            setFaqData(faqs);
        }
        setIsLoading(false);
    } else {
        // This handles custom plants passed directly or other cases
        setIsLoading(false);
    }
  }, [initialPlant, plantId, detailsFile, faqFile]);

  const getEstimatedHarvestDate = () => {
    if (!currentGardenEntry || !plant.daysToMaturity) return 'N/A';
    const planted = new Date(currentGardenEntry.plantedDate);
    const harvestDate = new Date(planted.setDate(planted.getDate() + plant.daysToMaturity));
    return harvestDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading Plant Details...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Could not load plant data.</Text>
      </View>
    );
  }

  const handleSaveWatering = async (newFrequency) => {
    if (!currentGardenEntry) return;

    const success = await saveWateringPreferenceForPlantInstance(currentGardenEntry.id, newFrequency);
    if (success) {
      const updatedGardenEntry = { ...currentGardenEntry, customWateringDays: newFrequency };
      setCurrentGardenEntry(updatedGardenEntry);

      Alert.alert(
        'Success',
        'Watering schedule updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              Alert.alert(
                'Set as Default?',
                `Would you like to make watering every ${newFrequency} days the new default for all future ${plant.name}s you add?`,
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes',
                    onPress: () => saveWateringPreferenceAsDefault(plant.id.toString(), newFrequency),
                  },
                ]
              );
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', 'Could not save the new watering schedule.');
    }
  };

  const wateringTask = plant?.careTasks?.find(t => t.name === 'Watering');

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {currentGardenEntry && (
          <View style={styles.card}>
          <Text style={styles.sectionTitle}>My {currentGardenEntry.nickname}</Text>
          <DetailRow
            icon="calendar-outline"
            label="Planted On"
            value={new Date(currentGardenEntry.plantedDate).toLocaleDateString()}
          />
          <DetailRow
            icon="leaf-outline"
            label="Est. Harvest"
            value={getEstimatedHarvestDate()}
          />
          <Text style={styles.progressLabel}>Progress to Maturity:</Text>
          <ProgressBar
            plantedDate={currentGardenEntry.plantedDate}
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
        {plant.soil && (
          <>
            <DetailRow icon="leaf-outline" label="Soil Type" value={plant.soil.type} />
            <DetailRow icon="analytics-outline" label="Soil pH" value={plant.soil.ph} />
          </>
        )}
      </View>

      <FaqSection faqData={faqData} />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Care Schedule</Text>
        {plant.careTasks && plant.careTasks.map((task, index) => {
          if (task.name === 'Watering') {
            const currentFrequency = currentGardenEntry?.customWateringDays || task.recurring;
            return (
              <View key={index} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskName}>{task.name}</Text>
                  {currentGardenEntry && (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                      <Text style={styles.adjustButton}>Adjust</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.taskDescription}>
                  {`Every ${currentFrequency} days. ${task.description}`}
                </Text>
              </View>
            );
          }
          return (
            <View key={index} style={styles.taskItem}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
    {wateringTask && (
        <AdjustWateringModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSave={handleSaveWatering}
            currentFrequency={currentGardenEntry?.customWateringDays || wateringTask.recurring || 3}
        />
    )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adjustButton: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
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
  faqItem: {
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});

export default PlantDetailScreen;
