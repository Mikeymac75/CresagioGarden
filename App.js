import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens (we'll create these next)
import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import PlantCalendarScreen from './screens/PlantCalendarScreen';
import GardenJournalScreen from './screens/GardenJournalScreen';
import SetupScreen from './screens/SetupScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Setup"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Setup" 
          component={SetupScreen} 
          options={{ title: 'Welcome to GardenCommand' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'GardenCommand' }}
        />
        <Stack.Screen 
          name="MyGarden" 
          component={MyGardenScreen} 
          options={{ title: 'My Garden (0/10)' }}
        />
        <Stack.Screen 
          name="PlantCalendar" 
          component={PlantCalendarScreen} 
          options={{ title: 'Planting Calendar' }}
        />
        <Stack.Screen 
          name="GardenJournal" 
          component={GardenJournalScreen} 
          options={{ title: 'Garden Journal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}