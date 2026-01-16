import * as SQLite from "expo-sqlite";

export type ExerciseRow = {
	id: number;
	name: string;
	muscle_group: string;
};

export type WorkoutRow = {
    id: number;
    name: string;
    duration: string;
    date: string;
};

const db = SQLite.openDatabaseSync("gym.db");

export const initDb = async () => {
    /* await db.execAsync(
        [
            "DROP TABLE IF EXISTS sets",
            "DROP TABLE IF EXISTS workout_exercises",
            "DROP TABLE IF EXISTS workouts",
            "DROP TABLE IF EXISTS exercises"
        ].join("; ") + ";"
    ); */
	await db.execAsync(
		[
			`
			CREATE TABLE IF NOT EXISTS exercises (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				muscle_group TEXT NOT NULL
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS workouts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				duration TEXT NOT NULL,
				date DATE NOT NULL
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS workout_exercises (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				workout_id INTEGER NOT NULL,
				exercise_id INTEGER NOT NULL,
				FOREIGN KEY(workout_id) REFERENCES workouts(id),
				FOREIGN KEY(exercise_id) REFERENCES exercises(id)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS sets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				workout_exercise_id INTEGER NOT NULL,
				reps INTEGER,
				weight REAL,
				FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id)
			)
			`,
		].join("; ") + ";"
	);
};

export const getExercises = async () => {
	return await db.getAllAsync<ExerciseRow>(
		"SELECT id, name, muscle_group FROM exercises ORDER BY name ASC"
	);
};

export const addExercise = async (name: string, muscleGroup: string) => {
	await db.runAsync(
		"INSERT INTO exercises (name, muscle_group) VALUES (?, ?)",
		[name, muscleGroup]
	);
};

export const getWorkouts = async () => {
    return await db.getAllAsync<WorkoutRow>(
        "SELECT id, name, duration, date FROM workouts ORDER BY date DESC"
    );
};

export const addWorkout = async (name: string, duration: string, date: string) => {
	const result = await db.runAsync(
		"INSERT INTO workouts (name, duration, date) VALUES (?, ?, ?)",
		[name, duration, date]
	);
	return result.lastInsertRowId as number;
};

export const addWorkoutExercise = async (workout_id: number, exercise_id: number) => {
	const result = await db.runAsync(
		"INSERT INTO workout_exercises (workout_id, exercise_id) VALUES (?, ?)",
		[workout_id, exercise_id]
	);
	return result.lastInsertRowId as number;
};

export const addSet = async (workout_exercise_id: number, reps: number, weight: number) => {
	const result = await db.runAsync(
		"INSERT INTO sets (workout_exercise_id, reps, weight) VALUES (?, ?, ?)",
		[workout_exercise_id, reps, weight]
	);
	return result.lastInsertRowId as number;
};


export default db;
