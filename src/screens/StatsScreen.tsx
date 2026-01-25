import { useEffect, useState, useMemo } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { ExerciseRow, addExercise, getExercises, getLatestExerciseSession, getExerciseHistory, ExerciseHistory } from "../services/database";
import ExerciseChart from "../components/Stats/ExerciseChart";
import AddExerciseModal from "../modal/AddExerciseModal";
import FilterExercisesModal from "../modal/FilterExercisesModal";


export default function StatsScreen() {
	const [exercises, setExercises] = useState<ExerciseRow[]>([]);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exerciseName, setExerciseName] = useState<string>("");
	const [muscleGroup, setMuscleGroup] = useState<string>("");

	const [latestSessions, setLatestSessions] = useState<Record<number, { workoutDate: string; sets: { reps: number; weight: number }[] } | null>>({});
	const [previewLoading, setPreviewLoading] = useState<Record<number, boolean>>({});

	const [exerciseHistories, setExerciseHistories] = useState<Record<number, ExerciseHistory[]>>({});

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

	const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

	const selectedCount = useMemo(() => selectedGroups.size, [selectedGroups]);
	
	const toggleGroup = (name: string) => {
		setSelectedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(name)) {
				next.delete(name);
			} else {
				next.add(name);
			}
			return next;
		});
	};

	const loadExerciseHistory = async (exerciseId: number) => {
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
		} catch (err) {
			setError("Failed to add exercise");
			console.error(err);
		} finally {
			closeModal();
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setIsFilterModalVisible(false);
		setError(null);
		setExerciseName("");
		setMuscleGroup("");
	};

	const openModal = () => {
		setIsModalVisible(true);
	};

	const openFilterModal = () => {
		setIsFilterModalVisible(true);
	};

	return (
		<View style={styles.container}>	
			<FlatList
				data={exercises}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => {
					const isExpanded = expandedId === item.id;

					if (!selectedGroups.has(item.muscle_group.toLowerCase()) && selectedGroups.size !== 0) {
						return (<View></View>);
					}

					return (
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
								const next = isExpanded ? null : item.id;
								setExpandedId(next);
								if (next != null) {
									loadExerciseHistory(item.id);
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

			<View style={styles.footer}>
				<Pressable
					onPress={() => { openModal(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
					style={({ pressed }) => [
						styles.footerButton,
						pressed && styles.footerButtonPressed
					]}
				>
					<Text style={styles.footerButtonText}>
						Add exercise
					</Text>
				</Pressable>

				<Pressable
					onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
					style={({ pressed }) => [
						styles.footerButton,
						pressed && styles.footerButtonPressed
					]}
				>
					<Text style={styles.footerButtonText}>
						Phase
					</Text>
				</Pressable>

				<Pressable
					onPress={() => { openFilterModal(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
					style={({ pressed }) => [
						styles.footerButton,
						pressed && styles.footerButtonPressed
					]}
				>
					<Text style={styles.footerButtonText}>
						Muscle Group
					</Text>
				</Pressable>
			</View>

			{isModalVisible ? (
				<AddExerciseModal 
					visible={isModalVisible}
					error={error}
					exerciseName={exerciseName}
					muscleGroup={muscleGroup}
					setExerciseName={setExerciseName}
					setMuscleGroup={setMuscleGroup}
					onClose={closeModal}
					onConfirm={handleAddExercise}
				/>
			) : null}

			{isFilterModalVisible ? (
				<FilterExercisesModal 
					visible={isFilterModalVisible}
					error={error}
					selectedGroups={selectedGroups}
					selectedCount={selectedCount}
					onToggleGroup={toggleGroup}
					onClose={closeModal}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 14,
		gap: 12,
		borderTopWidth: 1,
		borderTopColor: "#2c2c2c",
	},
	footerButton: {
		borderWidth: 1,
		borderColor: "#20ca17",
		borderRadius: 999,
		paddingVertical: 6,
		paddingHorizontal: 12,
	},
	footerButtonPressed: {
		opacity: 0.85,
	},
	footerButtonText: {
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
		backgroundColor: "#e3e3e3",
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
		color: "#1e1e1e",
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#505050",
		fontSize: 13,
	},
	statsPreview: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#2c2c2c",
	},
	statsText: {
		color: "#1e1e1e",
	},
	empty: {
		color: "#6b6b6b",
		textAlign: "center",
		marginTop: 24,
	},
});
