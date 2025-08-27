import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getItem as getSecureItem, setItem as setSecureItem } from './utils/SecureStorage';
import { Ionicons } from '@expo/vector-icons';
import FTUETour from './components/FTUETour';

import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import MyGardenScreen from './screens/MyGardenScreen';
import SeedBankScreen from './screens/SeedBankScreen';
import CustomPlantScreen from './screens/CustomPlantScreen';
import PlantCalendarScreen from './screens/PlantCalendarScreen';
import GardenJournalScreen from './screens/GardenJournalScreen';
import AllTasksCalendarScreen from './screens/AllTasksCalendarScreen';
import PlantDetailScreen from './screens/PlantDetailScreen';
import UpgradeScreen from './screens/UpgradeScreen';
import { ActivityIndicator, View } from 'react-native';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const GardenStack = createStackNavigator();
const CalendarStack = createStackNavigator();
const JournalStack = createStackNavigator();

const stackNavigatorOptions = {
  headerStyle: { backgroundColor: '#4CAF50' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

function GardenStackNavigator() {
  return (
    <GardenStack.Navigator screenOptions={stackNavigatorOptions}>
      <GardenStack.Screen
        name="MyGarden"
        component={MyGardenScreen}
        options={{ title: 'My Garden' }}
      />
      <GardenStack.Screen
        name="SeedBank"
        component={SeedBankScreen}
        options={{ title: 'Seed Bank' }}
      />
      <GardenStack.Screen
        name="CustomPlant"
        component={CustomPlantScreen}
        options={{ title: 'Create Custom Plant' }}
      />
      <GardenStack.Screen
        name="Upgrade"
        component={UpgradeScreen}
        options={{ headerShown: false }}
      />
    </GardenStack.Navigator>
  );
}

function CalendarStackNavigator() {
  return (
    <CalendarStack.Navigator screenOptions={stackNavigatorOptions}>
      <CalendarStack.Screen name="AllTasksCalendar" component={AllTasksCalendarScreen} options={{ title: 'All Tasks' }}/>
      <CalendarStack.Screen name="PlantingCalendar" component={PlantCalendarScreen} options={{ title: 'Planting Calendar' }}/>
    </CalendarStack.Navigator>
  );
}

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator screenOptions={stackNavigatorOptions}>
      <JournalStack.Screen name="GardenJournal" component={GardenJournalScreen} options={{ title: 'Journal' }}/>
    </JournalStack.Navigator>
  );
}

function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Garden') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="My Garden" component={GardenStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Journal" component={JournalStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [showFtueTour, setShowFtueTour] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const userDataString = await getSecureItem('userData');
        const ftueCompleteString = await getSecureItem('ftueComplete');

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData.setupComplete) {
            setInitialRoute('MainApp');
            if (ftueCompleteString !== 'true') {
              setShowFtueTour(true);
            }
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

  const handleFtueFinish = async () => {
    try {
      await setSecureItem('ftueComplete', 'true');
      setShowFtueTour(false);
    } catch (error) {
      console.error('Failed to save FTUE status:', error);
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <RootStack.Navigator initialRouteName={initialRoute}>
          <RootStack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="MainApp" component={MainAppTabs} options={{ headerShown: false }} />
          <RootStack.Screen
            name="PlantDetail"
            component={PlantDetailScreen}
            options={({ route }) => ({
              title: route.params.plant.name,
              ...stackNavigatorOptions,
              headerShown: true,
              presentation: 'modal',
            })}
          />
        </RootStack.Navigator>
      </NavigationContainer>
      <FTUETour isVisible={showFtueTour} onFinish={handleFtueFinish} />
    </>
  );
}
