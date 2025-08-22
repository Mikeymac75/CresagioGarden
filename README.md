# Garden Command

Garden Command is a mobile application designed to help gardeners of all levels plan, manage, and track their gardening activities. It provides personalized planting schedules, task reminders, and a wealth of information about various plants, all tailored to the user's local climate.

## Key Features

*   **Personalized Planting Calendar:** Get a customized planting schedule based on your local hardiness zone. Know the best times to start seeds indoors, transplant seedlings, and direct sow into your garden.
*   **Dynamic Task Management:** Automatically generates a personalized task list based on the plants in your garden. It creates tasks for initial planting, recurring watering schedules, specific care instructions (like fertilizing or pruning), and even reminds you when it's time to harvest. The weekly view keeps you focused on what's important now.
*   **My Garden:** Keep a virtual representation of your garden. Add plants you're growing and track their progress from seed to harvest.
*   **Plant Database:** Access a comprehensive database of common garden plants, complete with growing information, tips, and care instructions.
*   **Garden Journal:** Document your gardening journey, take notes, and keep track of your successes and challenges.
*   **Climate-Aware Suggestions:** The app provides suggestions for what you can plant right now based on the time remaining before the first frost in your area.
*   **Task Reminders via Notifications:** Receive local notifications for important gardening tasks like watering, fertilizing, and harvesting, ensuring you never miss a critical step.
*   **Real-Time Weather Integration & Alerts:** The app now fetches real-time weather forecasts to provide actionable alerts.
    *   **Dynamic Alerts:** Get warnings for frost, heatwaves, and heavy rain.
    *   **Smart Suggestions:** The app advises you to protect sensitive plants based on frost alerts and to skip watering when heavy rain is expected.
*   **Interactive Modals:** Get more details about tasks and plants by clicking on them.

## Getting Started

This project is built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/).

### Prerequisites

*   Node.js and npm (or yarn)
*   Expo CLI: `npm install -g expo-cli`
*   Expo Go app on your iOS or Android device

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/garden-command.git
    cd garden-command
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the Expo developer tools in your browser.

4.  **Run the app:**
    *   **On your mobile device:** Scan the QR code from the Expo developer tools using the Expo Go app.
    *   **In an emulator/simulator:** Follow the instructions in the Expo developer tools to run the app on an Android Emulator or iOS Simulator.

## Project Structure

```
.
├── assets/             # Images, icons, and other static assets
├── components/         # Reusable React Native components (e.g., WeatherWidget, SkeletonLoader)
├── data/               # Static JSON data for the application
│   └── plants/         # Plant data categorized by type (fruits, vegetables, etc.)
├── hooks/              # Custom React hooks (e.g., useSeedBank)
├── screens/            # Components for each screen of the app
├── services/           # Core business logic and API interactions
│   ├── utils/          # Utility functions for services
│   ├── GardeningService.js # Logic for hardiness zones, frost dates, and plantability
│   ├── NotificationService.js # Manages local notifications
│   ├── PlantService.js # Aggregates plant data
│   ├── TaskService.js  # Generates tasks for the user's garden
│   ├── WeatherService.js # Fetches and processes weather data
│   ├── constants.js    # Application-wide constants
├── utils/              # General utility functions
│   ├── SecureStorage.js # Wrapper for Expo's SecureStore
│   ├── scheduleGenerator.js
│   └── validationSchemas.js # Yup validation schemas
├── App.js              # Main app component and navigation setup
├── package.json        # Project dependencies and scripts
└── README.md
```

## Future Enhancements

This app is just getting started! Here are some ideas for future upgrades:

*   **UI/UX Refresh:**
    *   Implement a more dynamic and visually appealing home screen dashboard.
    *   Improve the calendar views with better filtering and visualization of tasks.
    *   Create a more engaging and "My Garden" view, perhaps with a visual layout tool.
*   **Expanded Plant Database:** Add more plants, including flowers and native species. Include more detailed information like pest and disease control, companion planting, and specific nutrient needs.
*   **Photo Journal:** Enable users to upload photos to their garden journal entries to visually track plant growth and garden changes.
*   **User Accounts & Cloud Sync:** Allow users to create accounts and sync their garden data across multiple devices. This would also enable true **Push Notifications** to sync tasks across devices.
*   **Community Features:** Create a space for users to share tips, ask questions, and show off their gardens.
*   **Pest & Disease Identifier:** Use the device's camera and machine learning to help users identify common garden pests and diseases.
