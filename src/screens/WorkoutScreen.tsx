import { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	Alert
} from "react-native";
import * as Haptics from 'expo-haptics';
import ExerciseSelectModal from "../modal/Workout/ExerciseSelectModal";
import ActiveWorkout from "../components/Workout/ActiveWorkout";
import { CommonStyles } from "../styles/CommonStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { Exercise, getExercises } from "../services/exercises";


export default function WorkoutScreen() {
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [exercises, setExercises] = useState<Exercise[] | null>([]);
	const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [error, setError] = useState<string | null>(null);

	const { session } = useAuthContext();

	const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsExercisesLoading(false);
			return;
		}

		try {
			setIsExercisesLoading(true);
			const exerciseData = await getExercises(session.user.id);
			setExercises(exerciseData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		} finally {
			setIsExercisesLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user.id) {
			loadData();
		}
	}, [session?.user.id]);

	const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

	const toggleExercise = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const startWorkout = () => {
		if (selectedIds.size === 0) {
			setError("Select at least one exercise");
			return;
		}
		setError(null);
		closeModal();
		if (!isWorkoutActive) {
			setIsWorkoutActive(true);
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setError(null);
		setIsModalVisible(true);
	};

	return (
		<View style={CommonStyles.container}>
			{isWorkoutActive ? (
				<ActiveWorkout
					exercises={exercises}
                	error={error}
					selectedIds={selectedIds}
					expandedId={expandedId}
					setError={setError}
					setExpandedId={setExpandedId}
					setIsModalVisible={setIsModalVisible}
					setIsWorkoutActive={setIsWorkoutActive}
					setSelectedIds={setSelectedIds}
				/>
			) : (
				<View style={CommonStyles.notActiveContainer}>
					<Text style={CommonStyles.text}>No active workout</Text>
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
						<Text style={CommonStyles.buttonText}>Log workout</Text>
					</Pressable>
				</View>
			)}

			<ExerciseSelectModal
                visible={isModalVisible}
                exercises={exercises}
				isLoading={isExercisesLoading}
				isWorkoutActive={isWorkoutActive}
                selectedIds={selectedIds}
                selectedCount={selectedCount}
                error={error}
				setSelectedIds={setSelectedIds}
                onToggleExercise={toggleExercise}
                onClose={closeModal}
                onConfirm={startWorkout}
            />
		</View>
	);
}
