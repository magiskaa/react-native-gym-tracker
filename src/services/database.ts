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

export type ExerciseHistory = {
	date: string;
	avgReps: number;
	avgWeight: number;
};

export type WeightHistory = {
	date: string;
	weight: number;
};

export type Profile = {
	id: number;
	username: string;
	image: string;
};

const db = SQLite.openDatabaseSync("gym.db");

export const initDb = async () => {
    /* await db.execAsync(
        [
            "DROP TABLE IF EXISTS sets",
            "DROP TABLE IF EXISTS workout_exercises",
            "DROP TABLE IF EXISTS workouts",
            "DROP TABLE IF EXISTS exercises",
			"DROP TABLE IF EXISTS weight",
			"DROP TABLE IF EXISTS profile",
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
				reps INTEGER NOT NULL,
				weight REAL NOT NULL,
				FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS weight (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				weight REAL NOT NULL,
				date DATE NOT NULL
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS profile (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL UNIQUE,
				image TEXT
			)
			`
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

export const getExerciseHistory = async (exercise_id: number) => {
	const history = await db.getAllAsync<{ date: string; totalReps: number; totalWeight: number; setCount: number }>(
		`
		SELECT
			w.date,
			SUM(s.reps) as totalReps,
			SUM(s.weight) as totalWeight,
			COUNT(s.id) as setCount
		FROM workout_exercises we
		JOIN workouts w ON w.id = we.workout_id
		JOIN sets s ON s.workout_exercise_id = we.id
		WHERE we.exercise_id = ?
		GROUP BY w.date
		ORDER BY w.date ASC
		`, 
		[exercise_id]
	);

	return history.map(row => {
		const [month, day] = row.date.slice(5).split("-");
		return {
			date: `${parseInt(day)}.${parseInt(month)}.`,
			avgReps: Math.round((row.totalReps / row.setCount) * 10) / 10,
			avgWeight: Math.round((row.totalWeight / row.setCount) * 10) / 10,
		};
	});
};

export const getLatestExerciseSession = async (exercise_id: number) => {
	const latest = await db.getFirstAsync<{ id: number; date: string }>(
		`SELECT we.id as id, w.date as date
		 FROM workout_exercises we
		 JOIN workouts w ON w.id = we.workout_id
		 WHERE we.exercise_id = ?
		 ORDER BY w.date DESC, we.id DESC
		 LIMIT 1`,
		[exercise_id]
	);
	if (!latest) return null;
	const sets = await db.getAllAsync<{ reps: number; weight: number }>(
		"SELECT reps, weight FROM sets WHERE workout_exercise_id = ? ORDER BY id ASC",
		[latest.id]
	);
	return { workoutExerciseId: latest.id, workoutDate: latest.date, sets };
};

export const getWeight = async () => {
    const history = await db.getAllAsync<WeightHistory>(
        "SELECT weight, date FROM weight ORDER BY date ASC"
    );

	return history.map(row => {
		const [month, day] = row.date.slice(5).split("-");

		return {
			date: `${parseInt(day)}.${parseInt(month)}.`,
			weight: row.weight,
		}
	});
};

export const addWeight = async (date: string, weight: number) => {
	await db.runAsync(
		"INSERT INTO weight (date, weight) VALUES (?, ?)",
		[date, weight]
	);
};

export const getProfile = async (username: string) => {
	return await db.getAllAsync<Profile>(
		"SELECT id, username, image FROM profile WHERE username = ?",
		[username]
	);
};

export const addProfile = async (username: string, image: string | null) => {
	await db.runAsync(
		"INSERT INTO profile (username, image) VALUES (?, ?)",
		[username, image]
	);
};

export const updateProfile = async (
	id: number,
	updates: { username?: string; image?: string | null }
) => {
	const fields: string[] = [];
	const values: (string | number | null)[] = [];

	if (updates.username !== undefined) {
		fields.push("username = ?");
		values.push(updates.username);
	}

	if (updates.image !== undefined) {
		fields.push("image = ?");
		values.push(updates.image);
	}

	if (fields.length === 0) return;

	values.push(id);
	await db.runAsync(
		`UPDATE profile SET ${fields.join(", ")} WHERE id = ?`,
		values
	);
};


export default db;
