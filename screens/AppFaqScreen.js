import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import faqData from '../assets/app_faq.json';

const FaqItem = ({ item }) => (
  <View style={styles.faqItem}>
    <Text style={styles.question}>{item.question}</Text>
    <Text style={styles.answer}>{item.answer}</Text>
  </View>
);

const AppFaqScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={faqData}
        renderItem={({ item }) => <FaqItem item={item} />}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.title}>App FAQ</Text>}
        ListFooterComponent={
          <Text style={styles.footerText}>
            Weather data provided by the Norwegian Meteorological Institute.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AppFaqScreen;
