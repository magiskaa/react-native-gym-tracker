import { useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { ExerciseRow, addExercise, getExercises, getLatestExerciseSession, getExerciseHistory, ExerciseHistory } from "../services/database";
import ExerciseChart from "../components/ExerciseChart";


export default function StatsScreen() {
	const [exercises, setExercises] = useState<ExerciseRow[]>([]);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [exerciseName, setExerciseName] = useState("");
	const [muscleGroup, setMuscleGroup] = useState("");
	const [isFormVisible, setIsFormVisible] = useState(false);

	const [latestSessions, setLatestSessions] = useState<Record<number, { workoutDate: string; sets: { reps: number; weight: number }[] } | null>>({});
	const [previewLoading, setPreviewLoading] = useState<Record<number, boolean>>({});

	const [exerciseHistories, setExerciseHistories] = useState<Record<number, ExerciseHistory[]>>({});

	const loadLatestSession = async (exerciseId: number) => {
		try {
			setPreviewLoading((prev) => ({ ...prev, [exerciseId]: true }));
			const session = await getLatestExerciseSession(exerciseId);
			setLatestSessions((prev) => ({ ...prev, [exerciseId]: session }));
			
			const history = await getExerciseHistory(exerciseId);
			setExerciseHistories((prev) => ({ ...prev, [exerciseId]: history }));
		} catch (e) {
			console.error("Failed to load latest session", e);
			setLatestSessions((prev) => ({ ...prev, [exerciseId]: null }));
			setExerciseHistories((prev) => ({ ...prev, [exerciseId]: [] }));
		} finally {
			setPreviewLoading((prev) => ({ ...prev, [exerciseId]: false }));
		}
	};

	const loadExercises = async () => {
		try {
			const rows = await getExercises();
			setExercises(rows);
		} catch (err) {
			setError("Failed to load exercises");
			console.error(err);
		}
	};

	useEffect(() => {
		loadExercises();
	}, []);

	const handleAddExercise = async () => {
		setIsAdding(true);
		setError(null);
		try {
			const trimmedName = exerciseName.trim();
			const trimmedGroup = muscleGroup.trim();

			if (!trimmedName || !trimmedGroup) {
				setError("Please enter a name and muscle group");
				return;
			}

			const allowedGroups = ["rinta", "olkapäät", "hauis", "ojentajat", "jalat", "selkä", "vatsat"];
			if (!allowedGroups.includes(trimmedGroup.toLowerCase())) {
				setError("Please enter a valid muscle group");
				return;
			}

			await addExercise(trimmedName, trimmedGroup);
			await loadExercises();
			setExerciseName("");
			setMuscleGroup("");
			setIsFormVisible(false);
		} catch (err) {
			setError("Failed to add exercise");
			console.error(err);
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Exercise Stats</Text>
				<Pressable
					onPress={() => setIsFormVisible((value) => !value)}
					disabled={isAdding}
					style={({ pressed }) => [
						styles.headerButton,
						pressed && !isAdding && styles.headerButtonPressed,
						isAdding && styles.headerButtonDisabled,
					]}
				>
					<Text style={styles.headerButtonText}>
						Add exercise
					</Text>
				</Pressable>
			</View>
			
			{isFormVisible ? (
				<View style={styles.form}>
					<TextInput
						value={exerciseName}
						onChangeText={setExerciseName}
						placeholder="Exercise name"
						placeholderTextColor="#8b8b8b"
						style={styles.input}
						editable={!isAdding}
					/>
					<TextInput
						value={muscleGroup}
						onChangeText={setMuscleGroup}
						placeholder="Muscle group"
						placeholderTextColor="#8b8b8b"
						style={styles.input}
						editable={!isAdding}
					/>
					<Pressable
						onPress={handleAddExercise}
						disabled={isAdding}
						style={({ pressed }) => [
							styles.addButton,
							pressed && !isAdding && styles.addButtonPressed,
							isAdding && styles.addButtonDisabled,
						]}
					>
						<Text style={styles.addButtonText}>Save exercise</Text>
					</Pressable>
				</View>
			) : null}
			{error ? <Text style={styles.error}>{error}</Text> : null}

			<FlatList
				data={exercises}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => {
					const isExpanded = expandedId === item.id;

					return (
						<Pressable
							onPress={() => {
								const next = isExpanded ? null : item.id;
								setExpandedId(next);
								if (next != null) {
									loadLatestSession(item.id);
								}
							}}
							style={({ pressed }) => [
								styles.card,
								pressed && styles.cardPressed,
							]}
						>
							<View style={styles.cardHeader}>
								<Text style={styles.cardTitle}>{item.name}</Text>
								<Text style={styles.cardSubtitle}>
									{item.muscle_group}
								</Text>
							</View>
							{isExpanded ? (
								<View style={styles.statsPreview}>
									{previewLoading[item.id] ? (
										<Text style={styles.statsText}>Loading…</Text>
									) : latestSessions[item.id] == null ? (
										<Text style={styles.statsText}>No logged sets yet</Text>
									) : (
										<View>
											<Text style={styles.statsText}>Latest session: {latestSessions[item.id]!.workoutDate}</Text>
											{latestSessions[item.id]!.sets.map((s, idx) => (
												<Text key={idx} style={styles.statsText}>
													Set {idx + 1}: {s.reps} reps @ {s.weight}
												</Text>
											))}
											<ExerciseChart
												history={exerciseHistories[item.id] || []}
												exerciseName={item.name}
											/>
										</View>
									)}
								</View>
							) : null}
						</Pressable>
					);
				}}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<Text style={styles.empty}>No exercises yet</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: "600",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
		gap: 12,
	},
	headerButton: {
		borderWidth: 1,
		borderColor: "#20ca17",
		borderRadius: 999,
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	headerButtonPressed: {
		opacity: 0.85,
	},
	headerButtonDisabled: {
		opacity: 0.6,
	},
	headerButtonText: {
		color: "#20ca17",
		fontWeight: "600",
	},
	error: {
		color: "#b00020",
		marginBottom: 8,
	},
	listContent: {
		paddingBottom: 24,
	},
	form: {
		gap: 10,
		marginBottom: 12,
	},
	input: {
		backgroundColor: "#3d3d3dff",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "#ffffff",
	},
	addButton: {
		backgroundColor: "#20ca17",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	addButtonPressed: {
		opacity: 0.85,
	},
	addButtonDisabled: {
		opacity: 0.6,
	},
	addButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		textAlign: "center",
	},
	card: {
		backgroundColor: "#1e1e1e",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
	},
	cardPressed: {
		opacity: 0.8,
	},
	cardHeader: {
		gap: 4,
	},
	cardTitle: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#c7c7c7",
		fontSize: 13,
	},
	statsPreview: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#2c2c2c",
	},
	statsText: {
		color: "#c7c7c7",
	},
	empty: {
		color: "#6b6b6b",
		textAlign: "center",
		marginTop: 24,
	},
});
