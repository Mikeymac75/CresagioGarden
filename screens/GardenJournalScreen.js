import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
} from '../utils/SecureStorage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function GardenJournalScreen() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryNote, setNewEntryNote] = useState('');
  const [newEntryPhotos, setNewEntryPhotos] = useState([]);

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      const fileName = imageUri.split('/').pop();
      const newPath = FileSystem.documentDirectory + fileName;

      try {
        await FileSystem.copyAsync({ from: imageUri, to: newPath });
        setNewEntryPhotos(prevPhotos => [...prevPhotos, newPath]);
      } catch (e) {
        console.error("Could not copy image:", e);
        Alert.alert('Error', 'Could not save the selected photo.');
      }
    }
  };

  const loadJournalEntries = async () => {
    try {
      const entries = await getSecureItem('journalEntries');
      if (entries) {
        setJournalEntries(JSON.parse(entries));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const addJournalEntry = async () => {
    if (!newEntryTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your journal entry');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      title: newEntryTitle.trim(),
      note: newEntryNote.trim(),
      date: new Date().toISOString(),
      photos: newEntryPhotos,
    };

    const updatedEntries = [newEntry, ...journalEntries];
    setJournalEntries(updatedEntries);

    try {
      await setSecureItem('journalEntries', JSON.stringify(updatedEntries));
      setNewEntryTitle('');
      setNewEntryNote('');
      setNewEntryPhotos([]);
      setShowAddEntry(false);
      Alert.alert('Success!', 'Journal entry added! 📝');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const deleteEntry = async (entryId) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
            setJournalEntries(updatedEntries);
            try {
              await setSecureItem('journalEntries', JSON.stringify(updatedEntries));
            } catch (error) {
              console.error('Error deleting journal entry:', error);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuickNoteTemplate = (template) => {
    const date = new Date().toLocaleDateString();
    switch (template) {
      case 'watering':
        setNewEntryTitle('Watering Day');
        setNewEntryNote(`Watered the garden today (${date}). Weather conditions: `);
        break;
      case 'harvest':
        setNewEntryTitle('Harvest Log');
        setNewEntryNote(`Harvested today (${date}):\n- \n\nNotes: `);
        break;
      case 'planting':
        setNewEntryTitle('New Plantings');
        setNewEntryNote(`Planted today (${date}):\n- \n\nLocation: \nNotes: `);
        break;
      case 'observation':
        setNewEntryTitle('Garden Observations');
        setNewEntryNote(`Garden observations (${date}):\n\nWeather: \nPlant health: \nPests/diseases: \nOther notes: `);
        break;
      default:
        break;
    }
    setShowAddEntry(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Garden Journal</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddEntry(true)}
        >
          <Text style={styles.addButtonText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Note Templates */}
      <View style={styles.quickTemplates}>
        <Text style={styles.quickTemplatesTitle}>Quick Notes:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.quickTemplate}
            onPress={() => getQuickNoteTemplate('watering')}
          >
            <Text style={styles.quickTemplateText}>💧 Watering</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickTemplate}
            onPress={() => getQuickNoteTemplate('harvest')}
          >
            <Text style={styles.quickTemplateText}>🥕 Harvest</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickTemplate}
            onPress={() => getQuickNoteTemplate('planting')}
          >
            <Text style={styles.quickTemplateText}>🌱 Planting</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickTemplate}
            onPress={() => getQuickNoteTemplate('observation')}
          >
            <Text style={styles.quickTemplateText}>👁️ Observation</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Start Your Garden Journal! 📔</Text>
            <Text style={styles.emptyStateText}>
              Track your garden progress, note important observations, and log your harvests.
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowAddEntry(true)}
            >
              <Text style={styles.emptyStateButtonText}>Add Your First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          journalEntries.map(entry => (
            <View key={entry.id} style={styles.journalEntry}>
              <View style={styles.entryHeader}>
                <View style={styles.entryTitleContainer}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                  <Text style={styles.deleteButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {entry.note && (
                <Text style={styles.entryNote}>{entry.note}</Text>
              )}

              {entry.photos && entry.photos.length > 0 && (
                <View>
                  <Text style={styles.photosTitle}>Photos:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {entry.photos.map((uri, index) => (
                      <Image key={index} source={{ uri }} style={styles.journalImage} />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Entry Modal */}
      <Modal
        visible={showAddEntry}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddEntry(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Journal Entry</Text>
            <TouchableOpacity onPress={addJournalEntry}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry title..."
              value={newEntryTitle}
              onChangeText={setNewEntryTitle}
              autoFocus={!newEntryTitle}
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What happened in your garden today?"
              value={newEntryNote}
              onChangeText={setNewEntryNote}
              multiline
              textAlignVertical="top"
            />

            <View>
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Text style={styles.addPhotoButtonText}>📷 Add a Photo</Text>
              </TouchableOpacity>
              <ScrollView horizontal style={styles.thumbnailContainer}>
                {newEntryPhotos.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.thumbnail} />
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickTemplates: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  quickTemplatesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quickTemplate: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickTemplateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
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
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
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
  journalEntry: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryTitleContainer: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    fontSize: 18,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  entryNote: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSave: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  addPhotoButton: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addPhotoButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  journalImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  }
});