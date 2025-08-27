import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UpgradeScreen = ({ navigation }) => {
  const handlePurchase = (tier) => {
    Alert.alert(
      'Coming Soon!',
      `In-app purchases for the "${tier}" tier are not yet available. Stay tuned!`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.mainTitle}>Unlock Your Full Gardening Potential</Text>
        <Text style={styles.subtitle}>
          Choose a plan that fits your garden's ambitions.
        </Text>

        <View style={styles.tierCard}>
          <Ionicons name="leaf-outline" size={32} color="#4CAF50" style={styles.tierIcon} />
          <Text style={styles.tierTitle}>More Plants</Text>
          <Text style={styles.tierDescription}>
            Expand your garden and grow a wider variety of plants.
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✅ Increase garden limit to 100 plants</Text>
            <Text style={styles.featureItem}>✅ Create up to 10 custom plants</Text>
          </View>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchase('More Plants')}
          >
            <Text style={styles.purchaseButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.tierCard, styles.proTier]}>
           <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>BEST VALUE</Text>
          </View>
          <Ionicons name="star-outline" size={32} color="white" style={styles.tierIcon} />
          <Text style={[styles.tierTitle, { color: 'white' }]}>Garden Pro</Text>
          <Text style={[styles.tierDescription, { color: '#E0E0E0' }]}>
            The ultimate toolkit for the dedicated gardener.
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: 'white' }]}>✅ Everything in "More Plants"</Text>
            <Text style={[styles.featureItem, { color: 'white' }]}>✅ Access to all future premium upgrades</Text>
            <Text style={[styles.featureItem, { color: 'white' }]}>✅ Advanced analytics (coming soon)</Text>
            <Text style={[styles.featureItem, { color: 'white' }]}>✅ Priority support</Text>
          </View>
          <TouchableOpacity
            style={[styles.purchaseButton, styles.proPurchaseButton]}
            onPress={() => handlePurchase('Garden Pro')}
          >
            <Text style={[styles.purchaseButtonText, { color: '#4CAF50' }]}>Go Pro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  tierCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  proTier: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  proBadge: {
    position: 'absolute',
    top: -15,
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 6,
  },
  proBadgeText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierIcon: {
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  proPurchaseButton: {
    backgroundColor: 'white',
  },
});

export default UpgradeScreen;
