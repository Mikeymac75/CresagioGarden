const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const plants = require('../data/plants.js');

// Path to the output database
const DB_OUTPUT_PATH = path.join(__dirname, '..', 'garden.db');

// Delete existing DB file if it exists
if (fs.existsSync(DB_OUTPUT_PATH)) {
  fs.unlinkSync(DB_OUTPUT_PATH);
}

// Create and open the database
const db = new sqlite3.Database(DB_OUTPUT_PATH, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create table
db.serialize(() => {
  db.run(`CREATE TABLE plants (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    harvestType TEXT,
    daysToMaturity INTEGER,
    spacing TEXT,
    sunRequirement TEXT,
    startIndoorsWeeksBefore INTEGER,
    transplantWeeksAfterLastFrost INTEGER,
    directSowWeeksAfterLastFrost INTEGER,
    wateringNeeds TEXT,
    wateringFrequencyDays INTEGER,
    frostTolerant BOOLEAN,
    description TEXT,
    tips TEXT,
    careTasks TEXT,
    conditionalAlerts TEXT,
    criticalTasks TEXT
  )`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Plants table created.');
  });

  // Insert data
  const stmt = db.prepare(`INSERT INTO plants VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  plants.forEach(plant => {
    stmt.run(
      plant.id,
      plant.name,
      plant.category,
      plant.harvestType,
      plant.daysToMaturity,
      plant.spacing,
      plant.sunRequirement,
      plant.startIndoorsWeeksBefore,
      plant.transplantWeeksAfterLastFrost,
      plant.directSowWeeksAfterLastFrost,
      plant.wateringNeeds,
      plant.wateringFrequencyDays,
      plant.frostTolerant,
      plant.description,
      plant.tips,
      JSON.stringify(plant.careTasks || []),
      JSON.stringify(plant.conditionalAlerts || []),
      JSON.stringify(plant.criticalTasks || [])
    );
  });
  stmt.finalize((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`${plants.length} records inserted into the plants table.`);
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Closed the database connection.');
});
