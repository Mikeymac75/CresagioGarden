import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
} from '../utils/SecureStorage';
import { getAllPlants } from '../services/DatabaseService';
import { useFocusEffect } from '@react-navigation/native';

const SEED_BANK_KEY = 'userSeedBank';

export default function useSeedBank() {
  const [seedBank, setSeedBank] = useState(new Set());
  const [allPlants, setAllPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch plants and seed bank in parallel
      const [plants, storedSeedBank] = await Promise.all([
        getAllPlants(),
        getSecureItem(SEED_BANK_KEY)
      ]);

      setAllPlants(plants);

      if (storedSeedBank) {
        setSeedBank(new Set(JSON.parse(storedSeedBank)));
      } else {
        setSeedBank(new Set());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load your data.');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggleSeedInBank = async (plantId) => {
    const newSeedBank = new Set(seedBank);
    if (newSeedBank.has(plantId)) {
      newSeedBank.delete(plantId);
    } else {
      newSeedBank.add(plantId);
    }
    setSeedBank(newSeedBank);

    try {
      await setSecureItem(SEED_BANK_KEY, JSON.stringify([...newSeedBank]));
    } catch (error) {
      Alert.alert('Error', 'Could not update your seed bank.');
      console.error('Error saving seed bank:', error);
      // Revert state on error
      setSeedBank(seedBank); // Revert to the old state
    }
  };

  const availablePlants = useMemo(() => {
    return allPlants.filter(plant => seedBank.has(plant.id));
  }, [seedBank, allPlants]);

  return { seedBank, allPlants, availablePlants, isLoading, toggleSeedInBank, loadData };
}
