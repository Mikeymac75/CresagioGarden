import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PestDiseaseDetailScreen = ({ route }) => {
  const { pest } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>{pest.name}</Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{pest.description}</Text>

        <Text style={styles.sectionTitle}>Prevention</Text>
        <Text style={styles.description}>{pest.prevention}</Text>

        <Text style={styles.sectionTitle}>Treatment</Text>
        <Text style={styles.description}>{pest.treatment}</Text>
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
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#4CAF50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});

export default PestDiseaseDetailScreen;
