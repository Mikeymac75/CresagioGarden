// src/App.js

// We'll use React's state management for this example, but the concept is the same anywhere.
import React, { useState } from 'react'; 

// --- Step 1: Import our data and our NEW schedule generator ---
import { PLANTS } from './data/plants.js';
import { generateScheduleForPlant } from './utils/scheduleGenerator.js';

function App() {
  // State to hold the plants the user has added to their garden
  const [myGarden, setMyGarden] = useState([]);
  
  // State to hold ALL tasks generated for all plants
  const [allTasks, setAllTasks] = useState([]);

  /**
   * This is the CORE function that connects everything.
   * It's called when a user clicks the "Add to Garden" button.
   * @param {number} plantId - The ID of the plant to add (e.g., 9 for Radishes).
   */
  const addPlantToGarden = (plantId) => {
    // --- Step 2: Find the full plant object from our data file ---
    const plantToAdd = PLANTS.find(p => p.id === plantId);
    if (!plantToAdd) {
      console.error("Plant not found!");
      return;
    }
    
    const plantingDate = new Date(); // Use today's date as the planting date

    // --- Step 3: USE OUR NEW GENERATOR to create all the tasks! ---
    // This is the magic connection that was missing.
    const newTasks = generateScheduleForPlant(plantToAdd, plantingDate);
    
    // --- Step 4: Update the application's state ---
    // Add the plant to our garden list
    const newGardenPlant = { 
      ...plantToAdd, 
      myPlantId: Date.now(), // Give it a unique ID in our garden
      plantingDate: plantingDate 
    };
    setMyGarden(prevGarden => [...prevGarden, newGardenPlant]);

    // Add all the newly generated tasks to our main task list
    setAllTasks(prevTasks => [...prevTasks, ...newTasks]);

    console.log(`Added ${plantToAdd.name} to garden.`);
    console.log('Generated Tasks:', newTasks);
  };

  // This is a simplified UI to demonstrate the functionality
  return (
    <div>
      <h1>GardenCommand</h1>
      
      <h2>Add a Plant</h2>
      {/* Create a button for each plant in our database */}
      {PLANTS.map(plant => (
        <button key={plant.id} onClick={() => addPlantToGarden(plant.id)}>
          Add {plant.name}
        </button>
      ))}

      <h2>My Tasks</h2>
      <ul>
        {allTasks.length > 0 ? (
          allTasks
            .sort((a, b) => a.date - b.date) // Sort tasks by date
            .map((task, index) => (
              <li key={index}>
                {task.date.toLocaleDateString()}: {task.taskName} 
                {task.recurringDays && ` (repeats every ${task.recurringDays} days)`}
              </li>
            ))
        ) : (
          <p>No tasks yet. Add a plant to your garden!</p>
        )}
      </ul>
    </div>
  );
}

export default App;