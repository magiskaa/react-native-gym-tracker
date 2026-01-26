import { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { ExerciseRow, getExercises } from "../services/database";
import ExerciseSelectModal from "../modal/ExerciseSelectModal";
import ActiveWorkout from "../components/Workout/ActiveWorkout";
import { CommonStyles } from "../styles/CommonStyles";


export default function WorkoutScreen() {
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [exercises, setExercises] = useState<ExerciseRow[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [error, setError] = useState<string | null>(null);

	const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
	const [expandedId, setExpandedId] = useState<number | null>(null);

	useEffect(() => {
		const loadExercises = async () => {
			const rows = await getExercises();
			setExercises(rows);
		};

		loadExercises();
	}, []);

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
		setIsModalVisible(true);
	};

	return (
		<View style={CommonStyles.container}>
			{isWorkoutActive ? (
				<ActiveWorkout
					exercises={exercises}
					selectedIds={selectedIds}
					expandedId={expandedId}
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
                selectedIds={selectedIds}
                selectedCount={selectedCount}
                error={error}
                onToggleExercise={toggleExercise}
                onClose={closeModal}
                onConfirm={startWorkout}
            />
		</View>
	);
}
