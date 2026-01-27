# React Native Gym Tracker

My third iteration of a gym tracker, now made specifically for mobile devices.
Track workouts, exercises, sets, body weight, nutrition, and training phases. Supports multiple users.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)

## Features

- Exercise library with muscle group and training phase filtering
- Workout logging with sets, reps, and weights
- Progress charts (exercise, weight, nutrition)
- Nutrition goals and daily calorie and protein intake tracking
- Training phases with start/end dates and weight goals
- Body weight logging
- Customizable profile

## Installation

0. Clone the repository

1. Install dependencies:
	- `npm install`

2. Start the app:
	- `npx expo start`
    or
    - `npx expo start --tunnel`

3. Scan the QR-code to open in Expo Go

## Project Structure

- src/assets: app icons
- src/screens: app screens
- src/components: UI components
- src/services: database access
- src/modal: modal dialogs
- src/styles: shared styles
- src/utils: utilities

## Data & Storage

All data is stored locally on-device using SQLite. The app seeds a default exercise list on first run.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Valtteri Antikainen**
vantikaine@gmail.com