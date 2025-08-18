import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const WeatherWidget = ({ weatherData }) => {
  if (!weatherData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching Local Weather...</Text>
      </View>
    );
  }

  const { currentWeather, frostWarning } = weatherData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Right Now</Text>
      <View style={styles.weatherInfo}>
        <Text style={styles.temperature}>
          {Math.round(currentWeather.temperature)}°C
        </Text>
        {/* In a real app, you would map currentWeather.symbol_code to an icon */}
        <Text style={styles.weatherSymbol}>☀️</Text>
      </View>
      {frostWarning && (
        <View style={styles.frostWarningContainer}>
          <Text style={styles.frostWarningText}>
            ❄️ Frost Warning! Temperatures may drop to 0°C or below in the next 48 hours. Protect sensitive plants!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F4F0',
    borderRadius: 8,
    margin: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  container: {
    backgroundColor: '#E8F5E9', // A light green background
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32', // Darker green
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temperature: {
    fontSize: 48,
    fontWeight: '200',
    color: '#1B5E20',
  },
  weatherSymbol: {
    fontSize: 48,
  },
  frostWarningContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#B3E5FC', // Light blue for the warning
    borderRadius: 8,
  },
  frostWarningText: {
    color: '#01579B', // Dark blue text
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WeatherWidget;
