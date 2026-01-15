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
				position INTEGER NOT NULL,
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

export default db;
