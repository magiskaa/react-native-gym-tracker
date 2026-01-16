import { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { ExerciseRow, getExercises } from "../services/database";

export default function WorkoutScreen() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [exercises, setExercises] = useState<ExerciseRow[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [error, setError] = useState<string | null>(null);

	const [isWorkoutActive, setIsWorkoutActive] = useState(false);
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
		setIsWorkoutActive(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setIsModalVisible(true);
	};

	return (
		<View style={styles.container}>

			{isWorkoutActive ? null : (
				<Pressable style={styles.logButton} onPress={openModal}>
					<Text style={styles.logButtonText}>Log workout</Text>
				</Pressable>
			)}

			<Modal
				visible={isModalVisible}
				animationType="slide"
				transparent
				onRequestClose={closeModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalSheet}>

						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Select exercises</Text>

							<Pressable onPress={closeModal}>
								<Text style={styles.modalClose}>Close</Text>
							</Pressable>
						</View>

						<FlatList
							data={exercises}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => {
								const isSelected = selectedIds.has(item.id);
								return (
									<Pressable
										onPress={() => toggleExercise(item.id)}
										style={({ pressed }) => [
											styles.exerciseRow,
											isSelected && styles.exerciseRowSelected,
											pressed && styles.exerciseRowPressed,
										]}
									>
										<View>
											<Text style={styles.exerciseName}>{item.name}</Text>
											<Text style={styles.muscleGroup}>
												{item.muscle_group}
											</Text>
										</View>

										<Text style={styles.exerciseSelected}>
											{isSelected ? "Selected" : ""}
										</Text>

									</Pressable>
								);
							}}
							ListEmptyComponent={
								<Text style={styles.empty}>No exercises found</Text>
							}
							contentContainerStyle={styles.exerciseList}
						/>

						<View style={styles.modalFooter}>
							<Text style={styles.modalFooterText}>
								Selected: {selectedCount}
							</Text>

							<Pressable style={styles.confirmButton} onPress={startWorkout}>
								<Text style={styles.confirmButtonText}>
									Use selection
								</Text>
							</Pressable>
						</View>

						{error ? <Text style={styles.error}>{error}</Text> : null}
					</View>
				</View>
			</Modal>

			{isWorkoutActive ? (
				<View>
					<FlatList
						data={exercises.filter(ex => selectedIds.has(ex.id))}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => {
							const isExpanded = expandedId === item.id;
		
							return (
								<Pressable
									onPress={() =>
										setExpandedId(isExpanded ? null : item.id)
									}
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
											<Text style={styles.statsText}>
												Stats will go here
											</Text>
										</View>
									) : null}
								</Pressable>
							);
						}}
						contentContainerStyle={styles.listContent}
						ListEmptyComponent={
							<Text style={styles.empty}>No exercises</Text>
						}
					/>
				</View>
			) : null}

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
		marginBottom: 12,
	},
	error: {
		color: "#b00020",
		marginBottom: 8,
		textAlign: "center"
	},
	logButton: {
		backgroundColor: "#2f6fed",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	logButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		textAlign: "center",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.55)",
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: "#0f0f0f",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 16,
		height: "70%",
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#ffffff",
	},
	modalClose: {
		color: "#8c8c8c",
		fontWeight: "500",
	},
	exerciseList: {
		paddingBottom: 16,
	},
	exerciseRow: {
		padding: 12,
		borderRadius: 12,
		backgroundColor: "#1a1a1a",
		marginBottom: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	exerciseRowSelected: {
		borderWidth: 1,
		borderColor: "#2f6fed",
	},
	exerciseRowPressed: {
		opacity: 0.85,
	},
	exerciseName: {
		color: "#ffffff",
		fontWeight: "600",
	},
	muscleGroup: {
		color: "#9a9a9a",
		fontSize: 12,
	},
	exerciseSelected: {
		color: "#2f6fed",
		fontSize: 12,
		fontWeight: "600",
	},
	modalFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#1f1f1f",
		paddingTop: 12,
		paddingBottom: 30
	},
	modalFooterText: {
		color: "#9a9a9a",
	},
	confirmButton: {
		backgroundColor: "#2f6fed",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	confirmButtonText: {
		color: "#ffffff",
		fontWeight: "600",
	},
	empty: {
		color: "#9a9a9a",
		textAlign: "center",
		marginTop: 12,
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
	listContent: {
		paddingBottom: 24,
	},
});
