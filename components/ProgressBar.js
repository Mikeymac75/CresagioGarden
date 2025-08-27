import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ plantedDate, daysToMaturity }) => {
  const planted = new Date(plantedDate);
  const today = new Date();

  const daysSincePlanted = Math.floor((today - planted) / (1000 * 60 * 60 * 24));
  const progress = Math.min(daysSincePlanted / daysToMaturity, 1);

  const progressPercentage = Math.round(progress * 100);

  return (
    <View>
      <Text style={styles.progressText}>
        Day {daysSincePlanted > 0 ? daysSincePlanted : 0} of {daysToMaturity} ({progressPercentage}%)
      </Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
});

export default ProgressBar;
