import { StyleSheet, Text, View, Pressable, ScrollView, FlatList } from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as Haptics from 'expo-haptics';
import { useAuth } from "../auth/AuthContext";
import { formatLocalDateISO } from "../utils/Utils";
import StartPhaseModal from "../modal/StartPhaseModal";
import { getCurrentPhase, addPhase, WeightHistory, getCurrentPhaseWeight } from "../services/database";
import ActivePhase from "../components/Phase/ActivePhase";
import PhaseChart from "../components/Phase/PhaseChart";


export default function PhaseScreen() {
	const [isPhaseActive, setIsPhaseActive] = useState<boolean>(false);
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [phase, setPhase] = useState<string>("maintain");
	const [startingWeight, setStartingWeight] = useState<number>(0);
	const [weightGoal, setWeightGoal] = useState<number | null>(null);

	const [phaseWeightHistory, setPhaseWeightHistory] = useState<WeightHistory[]>([]);

	const loadCurrentPhaseData = async () => {
		try {
			const currentPhaseData = await getCurrentPhase(user.id);
			if (currentPhaseData.length === 0) {
				setIsPhaseActive(false);
				setPhaseWeightHistory([]);
				return null;
			}

			const phaseStartDate = new Date(currentPhaseData[0].start_date);
			setStartDate(phaseStartDate);
			if (currentPhaseData[0].end_date) { setEndDate(new Date(currentPhaseData[0].end_date)); }
			setPhase(currentPhaseData[0].type);
			setStartingWeight(currentPhaseData[0].starting_weight);
			if (currentPhaseData[0].weight_goal) { setWeightGoal(currentPhaseData[0].weight_goal); }

			setIsPhaseActive(true);
			return phaseStartDate;
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	const loadWeightData = useCallback(async (date: Date | null = startDate) => {
		if (!date) {
			setPhaseWeightHistory([]);
			return;
		}
		const history = await getCurrentPhaseWeight(formatLocalDateISO(date));
		if (history.length !== 0) {
			setPhaseWeightHistory(history);
		} else {
			setPhaseWeightHistory([]);
		}
	}, [startDate]);

	useEffect(() => {
		loadCurrentPhaseData().then((phaseStartDate) => loadWeightData(phaseStartDate));
	}, [user.id]);

	const startPhase = async () => {
		const start = formatLocalDateISO(startDate);
		let end = null;
		
		if (endDate) {
			end = formatLocalDateISO(endDate);
			if (start.localeCompare(end) === 1 || start.localeCompare(end) === 0) {
				setError("End date can't be before the start date.");
				return;
			}
		}

		try {
			await addPhase(user.id, phase, start, end, startingWeight, weightGoal);
		} catch (error) {
			console.error(error);
		} finally {
			closeModal();
			loadCurrentPhaseData().then((phaseStartDate) => loadWeightData(phaseStartDate));
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
				<View>
					<ActivePhase 
						error={error}
						user={user.id}
						startDate={startDate}
						endDate={endDate}
						phase={phase}
						startingWeight={startingWeight}
						weightGoal={weightGoal}
						setStartDate={setStartDate}
						setEndDate={setEndDate}
						setPhase={setPhase}
						setStartingWeight={setStartingWeight}
						setWeightGoal={setWeightGoal}
						onWeightUpdate={loadWeightData}
					/>

					<PhaseChart 
						history={phaseWeightHistory}
						startingWeight={startingWeight}
						weightGoal={weightGoal}
					/>
				</View>
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
					startDate={startDate}
					endDate={endDate}
					phase={phase}
					setStartDate={setStartDate}
					setEndDate={setEndDate}
					setPhase={setPhase}
					setStartingWeight={setStartingWeight}
					setWeightGoal={setWeightGoal}
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
