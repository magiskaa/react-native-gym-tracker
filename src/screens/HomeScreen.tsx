import { StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { SetCount, WorkoutRow, getSetCountForCurrentWeek, getWorkouts } from "../services/database";
import { useFocusEffect } from "@react-navigation/native";
import SetsPerWeek from "../components/Home/SetsPerWeek";
import RecentWorkouts from "../components/Home/RecentWorkouts";
import { CommonStyles } from "../styles/CommonStyles";


export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
	const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
	const muscleGroups = ["Rinta", "Olkapäät", "Hauis", "Ojentajat", "Jalat", "Selkä", "Vatsat"];

	const loadData = useCallback(async () => {
		try {
			const setData = await getSetCountForCurrentWeek();
			const setCountMap = new Map(setData.map(item => [item.muscle_group, item.setCount]));
			const fullSetCounts = muscleGroups.map(group => ({
				muscle_group: group,
				setCount: setCountMap.get(group) || 0
			}));
			setSetCounts(fullSetCounts);

			const workoutData = await getWorkouts();
			setWorkouts(workoutData);
		} catch (error) {
			console.error(error);
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
