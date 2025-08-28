import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const TemperatureRange = ({ temperature, unit }) => {
  // Fahrenheit to Celsius conversion
  const toCelsius = (f) => Math.round(((f - 32) * 5) / 9);

  // Determine which values to use based on the selected unit
  const useFahrenheit = unit === 'F';
  const min = useFahrenheit ? temperature.absoluteMinF : toCelsius(temperature.absoluteMinF);
  const optimalLow = useFahrenheit ? temperature.optimalLowF : toCelsius(temperature.optimalLowF);
  const optimalHigh = useFahrenheit ? temperature.optimalHighF : toCelsius(temperature.optimalHighF);

  // Define the visual scale's min and max
  const scaleMin = useFahrenheit ? 0 : toCelsius(32); // Freezing point
  const scaleMax = useFahrenheit ? 100 : toCelsius(212); // Boiling point is too high, let's use a reasonable max
  const visualScaleMax = useFahrenheit ? 100 : 40;

  // Calculate the percentage position for each marker
  const getPosition = (temp) => {
    const position = ((temp - scaleMin) / (visualScaleMax - scaleMin)) * 100;
    return Math.max(0, Math.min(100, position)); // Clamp between 0 and 100
  };

  const minPosition = getPosition(min);
  const optimalLowPosition = getPosition(optimalLow);
  const optimalHighPosition = getPosition(optimalHigh);

  const optimalRangeWidth = optimalHighPosition - optimalLowPosition;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Temperature Range (°{unit})</Text>
      <View style={styles.scaleContainer}>
        <View style={styles.scaleBar} />
        <View style={[styles.optimalRange, { left: `${optimalLowPosition}%`, width: `${optimalRangeWidth}%` }]} />
        <View style={[styles.marker, { left: `${minPosition}%` }]}>
          <Text style={styles.markerText}>{min}°</Text>
          <Text style={styles.markerLabel}>Min</Text>
        </View>
        <View style={[styles.marker, { left: `${optimalLowPosition}%` }]}>
           <Text style={styles.markerText}>{optimalLow}°</Text>
        </View>
         <View style={[styles.marker, { left: `${optimalHighPosition}%` }]}>
           <Text style={styles.markerText}>{optimalHigh}°</Text>
        </View>
      </View>
       <Text style={styles.notes}>{temperature.notes}</Text>
    </View>
  );
};

TemperatureRange.propTypes = {
  temperature: PropTypes.shape({
    optimalLowF: PropTypes.number.isRequired,
    optimalHighF: PropTypes.number.isRequired,
    absoluteMinF: PropTypes.number.isRequired,
    notes: PropTypes.string,
  }).isRequired,
  unit: PropTypes.oneOf(['C', 'F']).isRequired,
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  scaleContainer: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 10,
  },
  scaleBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    width: '100%',
  },
  optimalRange: {
    position: 'absolute',
    height: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    top: '50%',
    transform: [{ translateY: -5 }],
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    top: '50%',
    transform: [{ translateX: -15 }], // Center the marker
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  markerLabel: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginTop: 4,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default TemperatureRange;
