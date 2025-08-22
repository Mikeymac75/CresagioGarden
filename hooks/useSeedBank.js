import React, { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
} from '../utils/SecureStorage';
import { loadPlants } from '../services/PlantService';
import { useFocusEffect } from '@react-navigation/native';

const SEED_BANK_KEY = 'userSeedBank';

export default function useSeedBank() {
  const [seedBank, setSeedBank] = useState(new Set());
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedSeedBank = await getSecureItem(SEED_BANK_KEY);
      if (storedSeedBank) {
        setSeedBank(new Set(JSON.parse(storedSeedBank)));
      } else {
        setSeedBank(new Set());
      }
      const loadedPlants = await loadPlants();
      setPlants(loadedPlants);
    } catch (error) {
      Alert.alert('Error', 'Could not load your seed bank or plant data.');
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

  const toggleSeedInBank = useCallback(async (plantId) => {
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
      const revertedSeedBank = new Set(seedBank);
      if (revertedSeedBank.has(plantId)) {
        revertedSeedBank.delete(plantId);
      } else {
        revertedSeedBank.add(plantId);
      }
      setSeedBank(revertedSeedBank);
    }
  }, [seedBank]);

  const availablePlants = useMemo(() => {
    return plants.filter(plant => seedBank.has(plant.id));
  }, [seedBank, plants]);

  return { seedBank, allPlants: plants, availablePlants, isLoading, toggleSeedInBank, loadSeedBank: loadData };
}
