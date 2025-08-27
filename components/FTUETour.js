import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';

const tourSteps = [
    {
      title: 'Welcome to Garden Command! 🌱',
      text: 'This quick tour will guide you through the first steps to get your digital garden growing.',
    },
    {
      title: 'The Main Tabs',
      text: 'At the bottom of the screen, you\'ll find your main navigation: Home, My Garden, Calendar, and Journal.',
    },
    {
      title: 'Find Your First Seeds',
      text: 'To get started, navigate to the "My Garden" tab. From there, tap "Manage Seed Bank" to browse all available plants.',
    },
    {
      title: 'Choose Your Plants',
      text: 'In the Seed Bank, simply tap on any plant you\'d like to grow. This adds it to your personal seed collection, making it available to plant.',
    },
    {
      title: 'Add a Plant to Your Garden',
      text: 'Once you\'ve selected your seeds, go back to the "My Garden" screen and tap "Add New Plant". Choose a plant from your collection and tell the app when you planted it.',
    },
    {
      title: 'View Your Tasks',
      text: 'That\'s it! The app will automatically generate a custom care schedule for your new plant. You\'ll find your first tasks on the Home screen.',
    },
  ];

const FTUETour = ({ isVisible, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.modalContent}>
          <Text style={styles.stepTitle}>{tourSteps[currentStep].title}</Text>
          <Text style={styles.stepText}>{tourSteps[currentStep].text}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>{isLastStep ? 'Finish' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

FTUETour.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onFinish: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    stepText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipButton: {
        padding: 10,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#888',
    },
    nextButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    nextButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default FTUETour;
