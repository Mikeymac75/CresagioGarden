# Garden Command

Garden Command is a mobile application designed to help gardeners of all levels plan, manage, and track their gardening activities. It provides personalized planting schedules, task reminders, and a wealth of information about various plants, all tailored to the user's local climate.

## Key Features

The application is organized into four main tabs, each with a distinct set of features:

### Home Screen

*   **At-a-Glance Dashboard:** A central hub that displays a welcome message, your hardiness zone, and key stats like the number of plants in your garden and upcoming tasks.
*   **Real-Time Weather Integration:** Shows the current weather forecast for your location.
*   **Dynamic Weather Alerts:** Provides actionable alerts for frost, heatwaves, and heavy rain, helping you protect your plants.
*   **Smart Task Management:**
    *   Organizes weekly tasks into collapsible daily sections like "Today," "Tomorrow," and so on.
    *   Automatically skips watering tasks if heavy rain is forecasted.
    *   Allows you to mark tasks as complete.
    *   **Snooze Tasks:** Postpone a single task by 3 days without affecting its recurring schedule.
*   **Climate-Aware Suggestions:** Recommends plants you can still grow based on the time remaining before the first frost.
*   **Interactive Modals:** Tap on a task or plant suggestion to get more details.

### My Garden

*   **Virtual Garden:** Keep a digital record of all the plants you are currently growing.
*   **Comprehensive Plant Database:** Browse a "Seed Bank" of common garden plants with detailed growing information.
*   **Dynamic Plant Detail Screen:** Get a detailed view of each plant, including its growth progress, care schedule, and photo journal.
*   **Add Custom Plants:** Flexibility to add your own custom plants to your garden.
*   **Track Plant Progress:** Monitor the status of each plant from seedling to harvest.

### Calendar

*   **Task Calendar:** View all upcoming gardening tasks in a calendar format.
*   **Personalized Planting Calendar:** Get a customized planting schedule based on your local hardiness zone, showing the best times to start seeds, transplant, and sow directly.

### Garden Journal

*   **Photo Journaling:** Visually document your garden's progress by adding photos to your journal entries.
*   **Digital Diary:** Document your gardening journey, take notes, and log your successes and challenges.
*   **Easy Entry Management:** Create, view, and manage your journal entries.

### Freemium Model

*   **Free Tier:** Enjoy core features like adding up to 10 plants, tracking tasks, and accessing the plant database.
*   **Premium Upgrade:** Unlock unlimited plants and gain access to exclusive future features.

### Core Features

*   **Local Notifications:** Receive timely reminders for important gardening tasks like watering, fertilizing, and harvesting.
*   **Secure Storage:** Your garden data is stored securely on your device.

## Getting Started

This project is built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/).

### Prerequisites

*   Node.js and npm (or yarn)
*   An iOS simulator or Android emulator, or a physical device.
*   EAS CLI for building the development client: `npm install -g eas-cli`

### Installation & Running

This project uses `expo-dev-client`, which requires a custom development client build.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/garden-command.git
    cd garden-command
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the development client:**

    Build the development client for your target platform. This command will produce a custom build of the app that includes `expo-dev-client`.

    ```bash
    # Build for iOS or Android
    npx eas build --profile development --platform [ios|android]
    ```
    Once the build is complete, download and install the app onto your physical device or simulator/emulator.

4.  **Start the development server:**

    With the development client installed and running, start the Metro server.

    ```bash
    npx expo start --dev-client
    ```
    Scan the QR code from the terminal using your device's camera to connect the development client to the server.

## Navigation Structure

The app's navigation is built using React Navigation and is organized as follows:

*   **Root Stack Navigator:**
    *   `SetupScreen`: The initial screen for first-time users to set up their profile (e.g., hardiness zone).
    *   `MainAppTabs`: The main interface of the app, accessible after the initial setup is complete.

*   **Main App Tabs (`BottomTabNavigator`):**
    *   **Home:** A dashboard displaying weather information and upcoming tasks.
    *   **My Garden:** A stack navigator for managing the user's garden.
        *   `MyGardenScreen`: View the plants in your garden.
        *   `SeedBankScreen`: Add new plants to your garden from a predefined list.
        *   `CustomPlantScreen`: Create a new custom plant to add to your garden.
    *   **Calendar:** A stack navigator for viewing tasks and planting schedules.
        *   `AllTasksCalendarScreen`: View all upcoming tasks.
        *   `PlantingCalendarScreen`: View the planting schedule for your plants.
    *   **Journal:** A stack navigator for the garden journal.
        *   `GardenJournalScreen`: View and manage journal entries.

## Project Structure

```
.
├── assets/             # Images, icons, and other static assets
├── components/         # Reusable React Native components (e.g., WeatherWidget, SkeletonLoader)
├── data/               # Static JSON data for the application
│   ├── plants/         # Plant data categorized by type (fruits, vegetables, etc.)
│   └── seasonal_tasks.json # Seasonal tasks data
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
*   **User Accounts & Cloud Sync:** Allow users to create accounts and sync their garden data across multiple devices. This would also enable true **Push Notifications** to sync tasks across devices.
*   **Community Features:** Create a space for users to share tips, ask questions, and show off their gardens.
*   **Pest & Disease Identifier:** Use the device's camera and machine learning to help users identify common garden pests and diseases.
