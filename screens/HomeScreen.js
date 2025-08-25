import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import useHomeScreenData from '../hooks/useHomeScreenData';
import WeatherWidget from '../components/WeatherWidget';
import { StatsCardSkeleton, TaskCardSkeleton } from '../components/SkeletonLoader';
import PropTypes from 'prop-types';

// Memoized Checkbox component to prevent re-renders
const Checkbox = React.memo(({ isChecked, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
    {isChecked && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
));

Checkbox.propTypes = {
    isChecked: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
};

const HomeScreen = ({ navigation }) => {
  const {
    userData,
    plantableNow,
    upcomingTasks,
    completedTasks,
    plantCount,
    loading,
    weatherData,
    toggleTask,
    handleChangeLocation,
  } = useHomeScreenData(navigation);

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskPress = (task) => {
    if (task.description) {
      setSelectedTask(task);
      setIsTaskModalVisible(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back! 🌱</Text>
           <View style={{...styles.locationText, backgroundColor: '#a5d6a7', width: 100, height: 20, borderRadius: 4}}/>
        </View>
        <WeatherWidget weatherData={null} locationAvailable={true} />
        <StatsCardSkeleton />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ This Week's Tasks</Text>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back! 🌱</Text>
        <TouchableOpacity onLongPress={handleChangeLocation}>
          <Text style={styles.locationText}>
            📍 Zone {userData?.hardinessZone || 'N/A'}
          </Text>
        </TouchableOpacity>
      </View>

      <WeatherWidget
        weatherData={weatherData}
        locationAvailable={!!(userData?.latitude && userData?.longitude)}
      />

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{plantCount}/10</Text>
          <Text style={styles.statLabel}>Plants in Garden</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{upcomingTasks.length}</Text>
          <Text style={styles.statLabel}>Tasks This Week</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ This Week's Tasks</Text>
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((item) => {
            const isCompleted = completedTasks.has(item.id);
            const isAlert = item.type === 'alert';
            const rainAlert = upcomingTasks.find(t => t.modifiesTasks === 'water' && formatDate(t.date) === 'Today');
            const isSkipped = item.type === 'water' && rainAlert && formatDate(item.date) === 'Today';
            const canToggle = !isAlert && !isSkipped;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.taskCard,
                  isAlert && styles.alertCard,
                  isSkipped && styles.skippedCard,
                ]}
                onPress={() => handleTaskPress(item)}
                disabled={!item.description || isAlert}
              >
                {canToggle ? (
                  <Checkbox isChecked={isCompleted} onToggle={() => toggleTask(item.id)} />
                ) : (
                  <Text style={{width: 24, marginRight: 15, textAlign: 'center'}}>{isSkipped ? '🌧️' : '🔔'}</Text>
                )}
                <View style={styles.taskDetails}>
                  <Text style={styles.taskDate}>{formatDate(item.date)}</Text>
                  <Text style={[styles.taskText, (isCompleted || isSkipped) && styles.completedTaskText]}>
                    {item.task}
                  </Text>
                  {isSkipped && <Text style={styles.skippedText}>Skipped due to rain</Text>}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>You're all caught up!</Text></View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 What You Can Still Plant</Text>
        {plantableNow.length > 0 ? (
          plantableNow.slice(0, 3).map(plant => (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantCard}
              onPress={() => handleTaskPress({ task: plant.name, description: plant.description })}
              disabled={!plant.description}
            >
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantTip}>💡 Matures in ~{plant.daysToMaturity} days</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}><Text style={styles.emptyStateText}>It's likely too late in the season to plant new crops.</Text></View>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTaskModalVisible}
        onRequestClose={() => {
          setIsTaskModalVisible(!isTaskModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedTask?.task}</Text>
            <Text style={styles.modalText}>{selectedTask?.description}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsTaskModalVisible(!isTaskModalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

HomeScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

export default React.memo(HomeScreen);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    header: { backgroundColor: '#4CAF50', padding: 20, paddingBottom: 40, paddingTop: 50 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    locationText: { fontSize: 16, color: '#E8F5E8' },
    statsCard: { backgroundColor: 'white', marginHorizontal: 20, marginTop: -30, padding: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-around', elevation: 5 },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
    statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: '#ddd' },
    section: { margin: 20, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    taskCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
    alertCard: {
      backgroundColor: '#E1F5FE', // Light blue
      borderColor: '#0288D1',
      borderWidth: 1,
    },
    skippedCard: {
      backgroundColor: '#E3F2FD',
      opacity: 0.7,
    },
    taskDetails: { flex: 1 },
    taskDate: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 },
    taskText: { fontSize: 16, color: '#333' },
    completedTaskText: { textDecorationLine: 'line-through', color: '#aaa' },
    skippedText: {
      fontSize: 12,
      color: '#0D47A1',
      fontStyle: 'italic',
      marginTop: 4,
    },
    plantCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10 },
    plantName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    plantTip: { fontSize: 12, color: '#2E7D32', fontStyle: 'italic' },
    emptyState: { backgroundColor: 'white', padding: 20, borderRadius: 8, alignItems: 'center' },
    emptyStateText: { fontSize: 16, color: '#666', textAlign: 'center' },
    checkboxBase: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderWidth: 2, borderColor: '#4CAF50', marginRight: 15 },
    checkboxChecked: { backgroundColor: '#4CAF50' },
    checkmark: { color: 'white', fontWeight: 'bold' },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
      marginTop: 15,
    },
    buttonClose: {
      backgroundColor: "#2196F3",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalTitle: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 20,
      fontWeight: 'bold'
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16
    }
});