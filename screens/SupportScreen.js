import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Cresagio Garden</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="heart" size={64} color="#E91E63" style={styles.heroIcon} />
        <Text style={styles.mainTitle}>Thank You for Using Cresagio Garden!</Text>
        <Text style={styles.subtitle}>
          This app is free and open source. All features are fully unlocked — no paywalls, no subscriptions, ever.
        </Text>

        <View style={styles.card}>
          <Ionicons name="cafe-outline" size={32} color="#FF6B35" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Buy Me a Coffee ☕</Text>
          <Text style={styles.cardDescription}>
            If you find Cresagio Garden helpful, consider buying me a coffee! It helps cover development costs and keeps the project going.
          </Text>
          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => Linking.openURL('https://buymeacoffee.com/The.Macs')}
          >
            <Ionicons name="cafe" size={20} color="white" />
            <Text style={styles.donateButtonText}>Buy Me a Coffee</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Ionicons name="logo-github" size={32} color="#333" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Contribute on GitHub</Text>
          <Text style={styles.cardDescription}>
            Cresagio Garden is open source! Report bugs, suggest features, or contribute code on GitHub.
          </Text>
          <TouchableOpacity
            style={[styles.donateButton, styles.githubButton]}
            onPress={() => Linking.openURL('https://github.com/Mikeymac75/CresagioGarden')}
          >
            <Ionicons name="logo-github" size={20} color="white" />
            <Text style={styles.donateButtonText}>View on GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Ionicons name="logo-discord" size={32} color="#5865F2" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>Join the Community</Text>
          <Text style={styles.cardDescription}>
            Connect with other gardeners, share tips, and get help in our Discord community.
          </Text>
          <TouchableOpacity
            style={[styles.donateButton, styles.discordButton]}
            onPress={() => Linking.openURL('https://discord.gg/7TMKKVNUsF')}
          >
            <Ionicons name="logo-discord" size={20} color="white" />
            <Text style={styles.donateButtonText}>Join Discord</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Made with 🌱 by a fellow gardener
        </Text>
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 16,
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 26,
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
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  donateButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  donateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  githubButton: {
    backgroundColor: '#333',
  },
  discordButton: {
    backgroundColor: '#5865F2',
  },
  footer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
});

export default SupportScreen;
