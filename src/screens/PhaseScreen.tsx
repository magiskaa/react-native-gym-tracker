import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as Haptics from 'expo-haptics';
import { formatLocalDateISO } from "../utils/Utils";
import StartPhaseModal from "../modal/Phase/StartPhaseModal";
import ActivePhase from "../components/Phase/ActivePhase";
import { CommonStyles } from "../styles/CommonStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { useToast } from "../components/ToastConfig";
import { getCurrentPhase, addPhase } from "../services/phase";
import { WeightEntry, getWeightHistory } from "../services/weights";


export default function PhaseScreen() {
	const [isPhaseActive, setIsPhaseActive] = useState<boolean>(false);
	const { session } = useAuthContext();
	const [error, setError] = useState<string | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const [phaseId, setPhaseId] = useState<number>(0);
	const [type, setType] = useState<string>("maintain");
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [startingWeight, setStartingWeight] = useState<number>(0);
	const [weightGoal, setWeightGoal] = useState<number | null>(null);

	const [phaseWeightHistory, setPhaseWeightHistory] = useState<WeightEntry[]>([]);

	const loadCurrentPhaseData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return { startDate: null, endDate: null}; 
		}

		try {
			const currentPhaseData = await getCurrentPhase(session.user.id);
			if (currentPhaseData.length === 0) {
				setIsPhaseActive(false);
				setPhaseId(0);
				setType("maintain");
				setStartDate(new Date());
				setEndDate(null);
				setStartingWeight(0);
				setWeightGoal(null);
				setPhaseWeightHistory([]);
				return { startDate: null, endDate: null};
			}

			setPhaseId(currentPhaseData[0].id);
			setType(currentPhaseData[0].type);

			const start = currentPhaseData[0].startDate;
			setStartDate(new Date(start));

			const end = currentPhaseData[0].endDate;
			if (end) { setEndDate(new Date(end)); }
			
			setStartingWeight(currentPhaseData[0].startingWeight);
			if (currentPhaseData[0].weightGoal) { setWeightGoal(currentPhaseData[0].weightGoal); }

			setIsPhaseActive(true);
			return { startDate: start, endDate: end };

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
			return { startDate: null, endDate: null};
		}
	};

	const loadWeightData = useCallback(async (
		start: string | null = formatLocalDateISO(startDate), 
		end: string | null = endDate ? formatLocalDateISO(endDate) : null
	) => {

        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}
		if (!start) {
			setPhaseWeightHistory([]);
			return;
		}

		try {
			const history = await getWeightHistory(session.user.id, start, end);
			if (history.length !== 0) {
				setPhaseWeightHistory(history);
			} else {
				setPhaseWeightHistory([]);
			}
		} catch {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		}
	}, [startDate, endDate]);

	useEffect(() => {
		loadCurrentPhaseData().then(({ startDate, endDate }) => loadWeightData(startDate, endDate));
	}, [session?.user.id]);

	const startPhase = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

		const start = formatLocalDateISO(startDate);
		let end = null;
		
		if (endDate) {
			end = formatLocalDateISO(endDate);
			if (start.localeCompare(end) >= 0) {
				setError("End date can't be before the start date");
				return;
			}
		}

		try {
			await addPhase(session.user.id, type, start, startingWeight, end, weightGoal);

			closeModal();
			loadCurrentPhaseData().then(({ startDate, endDate }) => loadWeightData(startDate, endDate));
			useToast("success", "Phase started", "Your phase was started successfully");

		} catch (error) {
			Alert.alert("Failed to start phase", "Please try again");
			console.error(`Failed to start phase: ${error}`);
		}
	};

	const endPhase = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}
		
		try {
			
		} catch (error) {
			Alert.alert("Failed to end phase", "Please try again");
			console.error(`Failed to end phase: ${error}`);
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
		<View style={[CommonStyles.container, { alignItems: "center" }]}>
			{isPhaseActive ? (
				<View style={{ width: "100%" }}>
					<ActivePhase 
						error={error}
						phaseId={phaseId}
						startDate={startDate}
						endDate={endDate}
						type={type}
						history={phaseWeightHistory}
						startingWeight={startingWeight}
						weightGoal={weightGoal}
						setError={setError}
						onWeightUpdate={loadWeightData}
						onPhaseUpdate={() => {
							loadCurrentPhaseData().then(({ startDate, endDate }) => loadWeightData(startDate, endDate));
						}}
					/>
				</View>
			) : (
				<View style={CommonStyles.notActiveContainer}>
					<Text style={CommonStyles.text}>No active phase</Text>
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
						<Text style={CommonStyles.buttonText}>Start phase</Text>
					</Pressable>
				</View>
			)}

			{isModalVisible ? (
				<StartPhaseModal 
					visible={isModalVisible}
					error={error}
					startDate={startDate}
					endDate={endDate}
					phase={type}
					setStartDate={setStartDate}
					setEndDate={setEndDate}
					setPhase={setType}
					setStartingWeight={setStartingWeight}
					setWeightGoal={setWeightGoal}
					onClose={closeModal}
					onConfirm={startPhase}
				/>
			) : null}
		</View>
	);
}
