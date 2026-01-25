import { StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { SetCount, WorkoutRow, getSetCountForCurrentWeek, getWorkouts } from "../services/database";
import { useFocusEffect } from "@react-navigation/native";
import SetsPerWeek from "../components/Home/SetsPerWeek";
import RecentWorkouts from "../components/Home/RecentWorkouts";


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
		<View style={styles.container}>
			<SetsPerWeek 
				setCounts={setCounts}
			/>
			<RecentWorkouts 
				workouts={workouts}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "flex-start",
	},
    title: {
        fontSize: 24,
        marginTop: 24,
		marginBottom: 4,
		marginHorizontal: 12,
        fontWeight: "600",
        color: "#1e1e1e",
    },
	setsPerWeekContainer: {
		backgroundColor: "#e3e3e3",
		padding: 8,
		width: 100,
		height: 125,
		borderRadius: 12,
		marginHorizontal: 4,
		marginVertical: 4,
	},
	muscleGroupText: {
		fontSize: 22,
		textAlign: "center",
		margin: "auto",
		marginBottom: 4,
	},
	workoutContainer: {
		backgroundColor: "#e3e3e3",
		padding: 12,
		width: 150,
		height: 100,
		borderRadius: 12,
		marginHorizontal: 4,
		marginVertical: 4,
	},
	workoutNameText: {
		fontSize: 22,
		fontWeight: 500,
		textAlign: "center",
		margin: "auto",
		marginTop: 0,
	},
	workoutText: {
		fontSize: 18,
		textAlign: "center",
		margin: "auto",
		marginBottom: 2,
	},
	listContent: {
		flexDirection: "row",
		flexWrap: "nowrap",
		flexGrow: 0,
		paddingVertical: 0,
		paddingHorizontal: 8,
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
