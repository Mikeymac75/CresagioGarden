import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import PlantCalendarScreen from './screens/PlantCalendarScreen';
import GardenJournalScreen from './screens/GardenJournalScreen';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.setupComplete) {
            setInitialRoute('Home');
          } else {
            setInitialRoute('Setup');
          }
        } else {
          setInitialRoute('Setup');
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setInitialRoute('Setup');
      }
    };

    checkSetup();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyGarden" component={MyGardenScreen} />
        <Stack.Screen name="PlantCalendar" component={PlantCalendarScreen} />
        <Stack.Screen name="GardenJournal" component={GardenJournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}