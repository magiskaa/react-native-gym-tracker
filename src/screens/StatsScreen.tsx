import { useEffect, useState, useMemo } from "react";
import {
	Alert,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import * as Haptics from 'expo-haptics';
import ExerciseChart from "../components/Stats/ExerciseChart";
import AddExerciseModal from "../modal/Stats/AddExerciseModal";
import FilterExercisesModal from "../modal/Stats/FilterExercisesModal";
import { CommonStyles } from "../styles/CommonStyles";
import { capitalize } from "../utils/Utils";
import { useToast } from "../components/ToastConfig";
import { useAuthContext } from "../auth/UseAuthContext";
import { Exercise, getExercises, addExercise, getExerciseHistory } from "../services/exercises";


export default function StatsScreen() {
	const [exercises, setExercises] = useState<Exercise[] | null>([]);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [exerciseName, setExerciseName] = useState<string>("");
	const [muscleGroup, setMuscleGroup] = useState<string>("rinta");

	const { profile, session, isLoading } = useAuthContext();

	const allowedGroups = ["rinta", "olkapäät", "hauis", "ojentajat", "jalat", "selkä", "vatsat"];

	const [latestSessions, setLatestSessions] = useState<Record<string, { workoutDate: string; sets: { reps: number; weight: number }[] } | null>>({});
	const [exerciseHistories, setExerciseHistories] = useState<Record<string, { avgReps: number, avgWeight: number, date: string }[]>>({});

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

	const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

	const selectedCount = useMemo(() => selectedGroups.size, [selectedGroups]);

	const loadExerciseHistory = async (exerciseId: number) => {
		try {
			// const latestSession = await getLatestExerciseSession(exerciseId);
			// setLatestSessions((prev) => ({ ...prev, [exerciseId]: latestSession }));
			
			const history = await getExerciseHistory(exerciseId);
			setExerciseHistories((prev) => ({ ...prev, [exerciseId]: history }));
		} catch (error) {
			Alert.alert("Failed to load exercise data", "Please try again later");
			console.error(`Failed to load exercise data ${error}`);

			setLatestSessions((prev) => ({ ...prev, [exerciseId]: null }));
			setExerciseHistories((prev) => ({ ...prev, [exerciseId]: [] }));  
		}
	};

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

		try {
			const exerciseData = await getExercises(session.user.id);
			setExercises(exerciseData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		}
	};

	useEffect(() => {
		if (!isLoading) {
			loadData();
		}
	}, [isLoading]);

	const handleAddExercise = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to add exercise", "Please sign in again");
			return; 
		}

		try {
			const trimmedName = exerciseName.trim();
			if (!trimmedName) {
				setError("Please enter a name");
				return;
			}
			if (!allowedGroups.includes(muscleGroup.toLowerCase())) {
				setError("Please enter a valid muscle group");
				return;
			}
			await addExercise(session.user.id, capitalize(trimmedName), capitalize(muscleGroup));
			
			closeModal();
			loadData();
			useToast("success", "Exercise added", "Your exercise was added succesfully");

		} catch (error) {
			useToast("error", "Failed to add exercise", "Please try again");
			console.error(`Failed to add exercise: ${error}`);
		}
	};

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
		<View style={CommonStyles.container}>	
			<FlatList
				data={exercises}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => {
					const isExpanded = expandedId === item.id;

					if (!selectedGroups.has(item.muscleGroup.toLowerCase()) && selectedGroups.size !== 0) {
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
									{item.muscleGroup}
								</Text>
							</View>
							{isExpanded ? (
								<View style={styles.statsPreview}>
									{exerciseHistories[item.id] == null ? (
										<Text style={styles.statsText}>No logged sets yet</Text>
									) : (
										<View>
											{/* <Text style={styles.statsText}>Latest session: {latestSessions[item.id]!.workoutDate}</Text>
											{latestSessions[item.id]!.sets.map((s, idx) => (
												<Text key={idx} style={styles.statsText}>
													Set {idx + 1}: {s.reps} reps @ {s.weight}kg
												</Text>
											))} */}
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
					<Text style={CommonStyles.empty}>No exercises yet</Text>
				}
			/>

			<View style={styles.footer}>
				<Pressable
					onPress={() => { 
						openModal(); 
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
					}}
					style={({ pressed }) => [
						CommonStyles.button,
						pressed && CommonStyles.buttonPressed
					]}
				>
					<Text style={CommonStyles.buttonText}>
						Add exercise
					</Text>
				</Pressable>

				<Pressable
					onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
					style={({ pressed }) => [
						CommonStyles.button,
						pressed && CommonStyles.buttonPressed
					]}
				>
					<Text style={CommonStyles.buttonText}>
						Phase
					</Text>
				</Pressable>

				<Pressable
					onPress={() => { openFilterModal(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
					style={({ pressed }) => [
						CommonStyles.button,
						pressed && CommonStyles.buttonPressed
					]}
				>
					<Text style={CommonStyles.buttonText}>
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
					allowedGroups={allowedGroups}
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
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		borderTopWidth: 1,
		borderTopColor: "#2b2b2b",
	},
	listContent: {
		paddingBottom: 24,
	},
	card: {
		backgroundColor: "#2b2b2b",
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
		color: "#f1f1f1",
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#767676",
		fontSize: 13,
	},
	statsPreview: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#1e1e1e",
	},
	statsText: {
		color: "#f1f1f1",
	},
});
