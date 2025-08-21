import React, { useState, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  getItem as getSecureItem,
  setItem as setSecureItem,
} from '../utils/SecureStorage';
import PLANTS from '../data/free_plants.json';
import { useFocusEffect } from '@react-navigation/native';

const SEED_BANK_KEY = 'userSeedBank';

export default function useSeedBank() {
  const [seedBank, setSeedBank] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadSeedBank = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedSeedBank = await getSecureItem(SEED_BANK_KEY);
      if (storedSeedBank) {
        setSeedBank(new Set(JSON.parse(storedSeedBank)));
      } else {
        setSeedBank(new Set());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load your seed bank.');
      console.error('Error loading seed bank:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSeedBank();
    }, [loadSeedBank])
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
      const revertedSeedBank = new Set(seedBank);
      if (revertedSeedBank.has(plantId)) {
        revertedSeedBank.delete(plantId);
      } else {
        revertedSeedBank.add(plantId);
      }
      setSeedBank(revertedSeedBank);
    }
  };

  const availablePlants = useMemo(() => {
    return PLANTS.filter(plant => seedBank.has(plant.id));
  }, [seedBank]);

  return { seedBank, availablePlants, isLoading, toggleSeedInBank, loadSeedBank };
}
