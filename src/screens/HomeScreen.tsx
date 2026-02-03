import { StyleSheet, Text, View, Alert } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import SetsPerWeek from "../components/Home/SetsPerWeek";
import RecentWorkouts from "../components/Home/RecentWorkouts";
import { CommonStyles } from "../styles/CommonStyles";
import { Workout, getWorkouts } from "../services/workouts";
import { SetCount, getSetCountsForCurrentWeek } from "../services/sets";
import { useAuthContext } from "../auth/UseAuthContext";


export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const muscleGroups = ["Rinta", "Olkapäät", "Hauis", "Ojentajat", "Jalat", "Selkä", "Vatsat"];

	const { session } = useAuthContext();

	const loadData = useCallback(async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

		try {
			const setData = await getSetCountsForCurrentWeek();
			const setCountMap = new Map(setData.map(item => [item.muscle_group, item.set_count]));
			const fullSetCounts = muscleGroups.map(group => ({
				muscleGroup: group,
				setCount: setCountMap.get(group) || 0
			}));
			setSetCounts(fullSetCounts);

			const workoutData = await getWorkouts(session.user.id);
			setWorkouts(workoutData);
		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadData();
		},[loadData])
	);

	return (
		<View style={[CommonStyles.container, { paddingHorizontal: 0 }]}>
			<SetsPerWeek 
				setCounts={setCounts}
			/>
			<RecentWorkouts 
				workouts={workouts}
			/>
		</View>
	);
}
