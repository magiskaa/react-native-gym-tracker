import { StyleSheet, Text, View, Pressable, ScrollView, FlatList } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import { useAuth } from "../auth/AuthContext";
import { formatDate } from "../utils/Utils";
import StartPhaseModal from "../modal/StartPhaseModal";
import { getCurrentPhase, addPhase } from "../services/database";
import ActivePhase from "../components/ActivePhase";


export default function PhaseScreen() {
	const [isPhaseActive, setIsPhaseActive] = useState<boolean>(false);
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const [startDateInput, setStartDateInput] = useState<Date>(new Date());
	const [endDateInput, setEndDateInput] = useState<Date | null>(null);
	const [phaseInput, setPhaseInput] = useState<string>("maintain");
	const [startingWeight, setStartingWeight] = useState<number>(0);
	const [weightGoalInput, setWeightGoalInput] = useState<number | null>(null);

	const loadData = async () => {
		try {
			const currentPhaseData = await getCurrentPhase(user.id);
			
			if (currentPhaseData.length === 0) {
				setIsPhaseActive(false);
				return;
			}
			console.log(currentPhaseData);

			setStartDateInput(new Date(currentPhaseData[0].start_date));
			if (currentPhaseData[0].end_date) { setEndDateInput(new Date(currentPhaseData[0].end_date)); }
			setPhaseInput(currentPhaseData[0].type);
			setStartingWeight(currentPhaseData[0].starting_weight);
			if (currentPhaseData[0].weight_goal) { setWeightGoalInput(currentPhaseData[0].weight_goal); }
			setIsPhaseActive(true);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const startPhase = async () => {
		const startDate = startDateInput.toISOString().slice(0, 10);
		let endDate = null;
		
		if (endDateInput) {
			endDate = endDateInput.toISOString().slice(0, 10);
			if (startDate.localeCompare(endDate) === 1 || startDate.localeCompare(endDate) === 0) {
				setError("End date can't be before the start date.");
				return;
			}
		}

		try {
			await addPhase(user.id, phaseInput, startDate, endDate, startingWeight, weightGoalInput);
		} catch (error) {
			console.log(error);
		} finally {
			closeModal();
			loadData();
		}
	};

	const endPhase = async () => {
		
		try {
			
		} catch (error) {
			console.error(error);
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setIsModalVisible(true);
		setError(null);
	};

	return (
		<View style={styles.container}>
			{isPhaseActive ? (
				<ActivePhase 
					error={error}
					user={user.id}
					startDateInput={startDateInput}
					endDateInput={endDateInput}
					phaseInput={phaseInput}
					startingWeight={startingWeight}
					weightGoalInput={weightGoalInput}
					setStartDateInput={setStartDateInput}
					setEndDateInput={setEndDateInput}
					setPhaseInput={setPhaseInput}
					setStartingWeight={setStartingWeight}
					setWeightGoalInput={setWeightGoalInput}
				/>
			) : (
				<View style={styles.phaseContainer}>
					<Text style={styles.text}>No active phase</Text>
					<Pressable style={styles.startButton} onPress={() => { openModal(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
						<Text style={styles.startButtonText}>Start phase</Text>
					</Pressable>
				</View>
			)}

			{isModalVisible ? (
				<StartPhaseModal 
					visible={isModalVisible}
					error={error}
					startDateInput={startDateInput}
					endDateInput={endDateInput}
					phaseInput={phaseInput}
					setStartDateInput={setStartDateInput}
					setEndDateInput={setEndDateInput}
					setPhaseInput={setPhaseInput}
					setStartingWeight={setStartingWeight}
					setWeightGoalInput={setWeightGoalInput}
					onClose={closeModal}
					onConfirm={startPhase}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		padding: 16,
	},
	phaseContainer: {
		width: "100%",
		height: "100%",
	},
	text: {
		fontSize: 20,
		fontWeight: 600,
		textAlign: "center",
		margin: "auto",
		marginBottom: 10,
	},
	startButton: {
		backgroundColor: "#20ca17",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
		margin: "auto",
		marginTop: 10,
	},
	startButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		textAlign: "center",
	},
	listContent: {
		flexDirection: "row",
		flexWrap: "nowrap",
		flexGrow: 0,
	},
	list: {
		flexGrow: 0,
	},
	empty: {
		color: "#6b6b6b",
		textAlign: "center",
		marginTop: 24,
	},
});
