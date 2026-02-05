# React Native Gym Tracker

My third iteration of a gym tracker, now made specifically for mobile devices.
Track workouts, exercises, sets, body weight, nutrition, and training phases. Supports multiple users.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

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

2. Create a supabase project with the DB schema from below

3. Create a file: `.env.local`, and input your supabase URL and publishable key

4. Start the app:
	- `npx expo start`
    or
    - `npx expo start --tunnel`

5. Scan the QR-code to open in Expo Go

## Data & Storage

This app uses [Supabase](https://supabase.com/) as the backend for authentication and database features.

### Database Schema

The app uses PostgreSQL with Row Level Security (RLS) policies. Tables include:
- `profiles`: User profiles. id, userId, username, image.
- `exercises`: Exercise library. id, userId, name, muscleGroup.
- `workouts`: Completed workout sessions. id, userId, name, duration, date.
- `workoutExercises`: A helper table to link sets into workouts and exercises. id, workoutId, exerciseId.
- `sets`: Individual sets within workouts. id, workoutExerciseId, reps, weight.
- `nutrition`: Daily nutrition logs. id, userId, date, calories, protein.
- `nutritionGoals`: Nutrition goals for each user. id, userId, calorieGoal, proteinGoal.
- `phases`: Training phases. id, userId, type, startDate, endDate, startingWeight, weightGoal.
- `weights`: Body weight logs. id, userId, weight, date.

All data is user-scoped with proper authentication checks.

## Project Structure

- `src/assets/`: App icons and static assets
- `src/auth/`: Authentication context and provider
- `src/screens/`: Main app screens (Home, Workout, Nutrition, etc.)
- `src/components/`: Reusable UI components
- `src/modal/`: Modal dialogs and forms
- `src/navigation/`: Navigation stacks
- `src/services/`: Database access functions
- `src/styles/`: Shared styles and themes
- `src/utils/`: Utility functions (date formatting, etc.)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Valtteri Antikainen**
vantikaine@gmail.com