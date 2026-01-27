import * as SQLite from "expo-sqlite";
import { formatLocalDateISO } from "../utils/Utils";

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
	password_hash: string;
	password_salt: string;
	image: string | null;
};

export type NutritionGoals = {
	calorie_goal: number | null;
	protein_goal: number | null;
};

export type SetCount = {
	muscle_group: string; 
	setCount: number;
}

export type NutritionRow = {
	user: number;
	calories: number | null;
	protein: number | null;
	date: string;
};

export type PhaseRow = {
	user: number;
	type: string;
	start_date: string;
	end_date: string | null;
	starting_weight: number;
	weight_goal: number | null;
};


const db = SQLite.openDatabaseSync("gym.db");

export const initDb = async () => {
	await db.execAsync(
		[
            //"DROP TABLE IF EXISTS workouts",
            //"DROP TABLE IF EXISTS exercises",
            //"DROP TABLE IF EXISTS workout_exercises",
			//"DROP TABLE IF EXISTS sets",
			//"DROP TABLE IF EXISTS weight",
			//"DROP TABLE IF EXISTS profile",
			//"DROP TABLE IF EXISTS nutrition",
			//"DROP TABLE IF EXISTS phase",
			`
			CREATE TABLE IF NOT EXISTS exercises (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				muscle_group TEXT NOT NULL,
				UNIQUE(name, muscle_group)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS user_exercises (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user INTEGER NOT NULL,
				name TEXT NOT NULL,
				muscle_group TEXT NOT NULL,
				FOREIGN KEY(user) REFERENCES profile(id),
				UNIQUE(name, muscle_group)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS workouts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user INTEGER NOT NULL,
				name TEXT NOT NULL,
				duration TEXT NOT NULL,
				date DATE NOT NULL,
				FOREIGN KEY(user) REFERENCES profile(id)
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
				user INTEGER NOT NULL,
				weight REAL NOT NULL,
				date DATE NOT NULL,
				FOREIGN KEY(user) REFERENCES profile(id),
				UNIQUE(user, date)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS profile (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT NOT NULL UNIQUE,
				password_hash TEXT NOT NULL,
				password_salt TEXT NOT NULL,
				image TEXT,
				calorie_goal INTEGER,
				protein_goal INTEGER
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS nutrition (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user INTEGER NOT NULL,
				calories INTEGER,
				protein INTEGER,
				date TEXT NOT NULL,
				FOREIGN KEY(user) REFERENCES profile(id),
				UNIQUE(user, date)
			)
			`,
			`
			CREATE TABLE IF NOT EXISTS phase (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user INTEGER NOT NULL,
				type TEXT NOT NULL,
				start_date TEXT NOT NULL,
				end_date TEXT,
				starting_weight REAL NOT NULL,
				weight_goal REAL,
				FOREIGN KEY(user) REFERENCES profile(id),
				UNIQUE(user, start_date)
			)
			`
		].join("; ") + ";"
	);

	await db.runAsync(
		`
		INSERT OR IGNORE INTO exercises (name, muscle_group)
		VALUES
			('Penkkipunnerrus käsipainoilla', 'Rinta'),
			('Penkkipunnerrus tangolla', 'Rinta'),
			('Pec Fly', 'Rinta'),
			('Dipit', 'Rinta'),
			('Punnerrus', 'Rinta'),
			('Vinopenkkipunnerrus käsipainoilla', 'Rinta'),
			('Pystypunnerrus käsipainoilla', 'Olkapäät'),
			('Pystypunnerrus tangolla', 'Olkapäät'),
			('Pystypunnerrus laitteella', 'Olkapäät'),
			('Vipunostot eteen', 'Olkapäät'),
			('Vipunostot sivulle', 'Olkapäät'),
			('Ojentajapunnerrus', 'Ojentajat'),
			('Ojentajapunnerrus köydellä', 'Ojentajat'),
			('Skullchrusher', 'Ojentajat'),
			('Reverse Fly', 'Selkä'),
			('Chin up', 'Selkä'),
			('Pull up', 'Selkä'),
			('Maastaveto suorin jaloin', 'Selkä'),
			('Soutu', 'Selkä'),
			('Ylätalja', 'Selkä'),
			('Alatalja', 'Selkä'),
			('Pullover', 'Selkä'),
			('Hauiskääntö käsipainoilla', 'Hauis'),
			('Hauiskääntö tangolla', 'Hauis'),
			('Hauiskääntö vinopenkillä', 'Hauis'),
			('Hauiskääntö taljassa', 'Hauis'),
			('Hauiskääntö laitteessa', 'Hauis'),
			('Hammercurl', 'Hauis'),
			('Kyykky', 'Jalat'),
			('Pohjenousu seisten', 'Jalat'),
			('Pohjenousu istuen', 'Jalat'),
			('Etureidet laitteessa', 'Jalat'),
			('Takareidet laitteessa maaten', 'Jalat'),
			('Takareidet laitteessa istuen', 'Jalat'),
			('Pakarat abduktio', 'Jalat'),
			('Nivuset adduktio', 'Jalat'),
			('Vatsalihasrutistus', 'Vatsat');
		`
	);
};

/* 
===============================================================================
|                                  EXERCISES                                  |
===============================================================================
*/
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

/* 
===============================================================================
|                                   WORKOUTS                                  |
===============================================================================
*/
export const getWorkouts = async () => {
    return await db.getAllAsync<WorkoutRow>(
        "SELECT id, name, duration, date FROM workouts ORDER BY date DESC LIMIT 5"
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

/* 
===============================================================================
|                                     SETS                                    |
===============================================================================
*/
export const getSetCountForCurrentWeek = async () => {
	const now = new Date();
	const dayIndex = (now.getDay() + 6) % 7;
	const monday = new Date(now);
	monday.setDate(now.getDate() - dayIndex);

	const startDate = formatLocalDateISO(monday);
	const endDate = formatLocalDateISO(now);

	return await db.getAllAsync<SetCount>(
		`
		SELECT
			ex.muscle_group,
			COUNT(s.id) as setCount
		FROM exercises ex
		JOIN workout_exercises we ON we.exercise_id = ex.id
		JOIN workouts w ON w.id = we.workout_id
		JOIN sets s ON s.workout_exercise_id = we.id
		WHERE w.date >= ? AND w.date <= ?
		GROUP BY ex.muscle_group
		`,
		[startDate, endDate]
	);
};

export const addSet = async (workout_exercise_id: number, reps: number, weight: number) => {
	const result = await db.runAsync(
		"INSERT INTO sets (workout_exercise_id, reps, weight) VALUES (?, ?, ?)",
		[workout_exercise_id, reps, weight]
	);
	return result.lastInsertRowId as number;
};

/* 
===============================================================================
|                                EXERCISE DATA                                |
===============================================================================
*/
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

/* 
===============================================================================
|                                    WEIGHT                                   |
===============================================================================
*/
export const getWeight = async (user: number) => {
    return await db.getAllAsync<WeightHistory>(
        "SELECT weight, date FROM weight WHERE user = ? ORDER BY date ASC",
		[user]
    );
};

export const getCurrentWeight = async (user: number) => {
	return await db.getAllAsync<{weight: number}>(
		"SELECT weight FROM weight WHERE user = ? ORDER BY date DESC LIMIT 1",
		[user]
	);
};

export const getCurrentPhaseWeight = async (user: number, start_date: string) => {
	return await db.getAllAsync<WeightHistory>(
		`
		SELECT weight, date 
		FROM weight
		WHERE user = ?
		AND date >= ?
		ORDER BY date ASC
		`,
		[user, start_date]
	);
};

export const addWeight = async (user: number, weight: number, date: string) => {
	await db.runAsync(
		"INSERT INTO weight (user, weight, date) VALUES (?, ?, ?)",
		[user, weight, date]
	);
};

/* 
===============================================================================
|                                   PROFILE                                   |
===============================================================================
*/
export const getProfile = async (username: string) => {
	return await db.getAllAsync<Profile>(
		"SELECT id, username, password_hash, password_salt, image FROM profile WHERE username = ?",
		[username]
	);
};

export const addProfile = async (
	username: string, 
	image: string | null, 
	passwordHash: string, 
	passwordSalt: string, 
	calorie_goal: number | null, 
	protein_goal: number | null
) => {
	await db.runAsync(
		`
		INSERT INTO profile (
			username, 
			password_hash, 
			password_salt, 
			image, 
			calorie_goal, 
			protein_goal
		) VALUES (?, ?, ?, ?, ?, ?)
		`,
		[username, passwordHash, passwordSalt, image, calorie_goal, protein_goal]
	);
};

export const updateProfile = async (
	id: number,
	updates: {
		username?: string;
		image?: string | null;
		password_hash?: string | null;
		password_salt?: string | null;
	}
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

	if (updates.password_hash !== undefined) {
		fields.push("password_hash = ?");
		values.push(updates.password_hash);
	}

	if (updates.password_salt !== undefined) {
		fields.push("password_salt = ?");
		values.push(updates.password_salt);
	}

	if (fields.length === 0) return;

	values.push(id);
	await db.runAsync(
		`UPDATE profile SET ${fields.join(", ")} WHERE id = ?`,
		values
	);
};

/* 
===============================================================================
|                                  NUTRITION                                  |
===============================================================================
*/
export const getNutrition = async (user: number) => {
	return await db.getAllAsync<NutritionRow>(
		`
		SELECT 
			user, 
			calories, 
			protein, 
			date 
		FROM nutrition
		WHERE user = ?
		ORDER BY date DESC
		`,
		[user]
	);
};

export const getNutritionByDate = async (user: number, date: string) => {
	return await db.getAllAsync<NutritionRow>(
		`
		SELECT
			user,
			calories,
			protein,
			date
		FROM nutrition
		WHERE user = ?
		AND date = ?
		`,
		[user, date]
	);
};

export const addNutrition = async (user: number, date: string) => {
	await db.runAsync(
		`
		INSERT INTO nutrition (user, calories, protein, date)
		VALUES (?, null, null, ?)
		`,
		[user, date]
	);

	return getNutrition(user);
};

export const updateNutrition = async (user: number, calories: number, protein: number, date: string) => {
	await db.runAsync(
		`
		UPDATE nutrition 
		SET calories = ?, protein = ? 
		WHERE user = ? 
		AND date = ?
		`,
		[calories, protein, user, date]
	);
};

export const getNutritionGoals = async (user: number) => {
	return await db.getAllAsync<NutritionGoals>(
		"SELECT calorie_goal, protein_goal FROM profile WHERE id = ?",
		[user]
	);
};

export const updateNutritionGoals = async (user: number, calorie_goal: number, protein_goal: number) => {
	await db.runAsync(
		`
		UPDATE profile 
		SET calorie_goal = ?, protein_goal = ?
		WHERE id = ?
		`,
		[calorie_goal, protein_goal, user]
	);
};


/* 
===============================================================================
|                                    PHASE                                    |
===============================================================================
*/
export const getCurrentPhase = async (user: number) => {
	const today = new Date().toISOString().slice(0, 10);

	return await db.getAllAsync<PhaseRow>(
		`
		SELECT 
			user, 
			type, 
			start_date,
			end_date,
			starting_weight,
			weight_goal
		FROM phase
		WHERE user = ?
		AND end_date >= ? OR end_date = null
		ORDER BY start_date DESC
		LIMIT 1
		`,
		[user, today]
	);
};

export const addPhase = async (user: number, type: string, start_date: string, end_date: string | null, starting_weight: number, weight_goal: number | null) => {
	await db.runAsync(
		`
		INSERT INTO phase (user, type, start_date, end_date, starting_weight, weight_goal) 
		VALUES (?, ?, ?, ?, ?, ?) 
		`,
		[user, type, start_date, end_date, starting_weight, weight_goal]
	);
};

export const updatePhase = async (user: number, type: string, start_date: string, end_date: string | null, starting_weight: number, weight_goal: number | null) => {
	await db.runAsync(
		`
		UPDATE phase
		SET type = ?, start_date = ?, end_date = ?, starting_weight = ?, weight_goal = ?
		WHERE user = ?
		AND start_date = ?
		`,
		[type, start_date, end_date, starting_weight, weight_goal, user, start_date]
	);
};


export default db;
