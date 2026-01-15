import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("../data/gym.db");

export const initDb = async () => {
	await db.execAsync(
		[
			"CREATE TABLE IF NOT EXISTS", 
            "exercises (",
                "id INTEGER PRIMARY KEY AUTOINCREMENT,", 
                "name TEXT NOT NULL,", 
                "muscle_group TEXT NOT NULL",
            ")",
			"CREATE TABLE IF NOT EXISTS", 
            "workouts (",
                "id INTEGER PRIMARY KEY AUTOINCREMENT,",
                "name TEXT NOT NULL,",
                "duration TEXT NOT NULL,",
                "date TEXT NOT NULL",
            ")",
			"CREATE TABLE IF NOT EXISTS", 
            "workout_exercises (",
                "id INTEGER PRIMARY KEY AUTOINCREMENT,",
                "workout_id INTEGER NOT NULL,",
                "exercise_id INTEGER NOT NULL,",
                "position INTEGER NOT NULL,",
                "FOREIGN KEY(workout_id) REFERENCES workouts(id),",
                "FOREIGN KEY(exercise_id) REFERENCES exercises(id)",
            ")",
			"CREATE TABLE IF NOT EXISTS",
            "sets (",
                "id INTEGER PRIMARY KEY AUTOINCREMENT,", 
                "workout_exercise_id INTEGER NOT NULL,",
                "reps INTEGER,",
                "weight REAL,",
                "FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id)",
            ")",
		].join("; ") + ";"
	);
};

export default db;
