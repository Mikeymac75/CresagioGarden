import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite/next';
import { Asset } from 'expo-asset';

const DB_NAME = 'garden.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

let db;

// Function to open the database
const openDatabase = async () => {
  if (db) {
    return db;
  }

  const asset = Asset.fromModule(require(`../assets/${DB_NAME}`));
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  const dbFile = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite`);
  if (!dbFile.exists) {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`);
  }

  const existingDb = await FileSystem.getInfoAsync(DB_PATH);
  if (!existingDb.exists) {
    await FileSystem.copyAsync({
      from: asset.uri,
      to: DB_PATH,
    });
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
};

// Function to get all plants from the database
export const getAllPlants = async () => {
  const db = await openDatabase();
  const plants = await db.getAllAsync('SELECT * FROM plants');

  // Deserialize JSON fields
  return plants.map(plant => ({
    ...plant,
    frostTolerant: Boolean(plant.frostTolerant), // SQLite stores booleans as 0 or 1
    careTasks: JSON.parse(plant.careTasks || '[]'),
    conditionalAlerts: JSON.parse(plant.conditionalAlerts || '[]'),
    criticalTasks: JSON.parse(plant.criticalTasks || '[]'),
  }));
};

// A function to get a single plant by ID, which might be useful later.
export const getPlantById = async (id) => {
    const db = await openDatabase();
    const plant = await db.getFirstAsync('SELECT * FROM plants WHERE id = ?', [id]);

    if (!plant) {
        return null;
    }

    return {
        ...plant,
        frostTolerant: Boolean(plant.frostTolerant),
        careTasks: JSON.parse(plant.careTasks || '[]'),
        conditionalAlerts: JSON.parse(plant.conditionalAlerts || '[]'),
        criticalTasks: JSON.parse(plant.criticalTasks || '[]'),
    };
};
