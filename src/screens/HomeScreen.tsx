import { StyleSheet, Text, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { SetCount, WorkoutRow, getSetCountForCurrentWeek, getWorkouts } from "../services/database";
import { Circle } from "react-native-progress";

export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
	const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
	const muscleGroups = ["Rinta", "Olkapäät", "Hauis", "Ojentajat", "Jalat", "Selkä", "Vatsat"];

	const loadData = async () => {
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
			console.log(error);
		}
	};

	useEffect(() => {
		loadData();
	},[])

	const formatDate = (date: string) => {
		const parts = date.split("-");
		return `${parts[2].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[0]}`
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sets / Week</Text>
			<FlatList
				data={setCounts}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.muscle_group}
				style={styles.list}
				renderItem={({ item }) => {	
					return (
						<View style={styles.setsPerWeekContainer}>
							<Text style={styles.muscleGroupText}>{item.muscle_group}</Text>
							<Circle 
								progress={(item.setCount / 10) > 1 ? 1 : (item.setCount / 10)}
								size={84}
								thickness={3}
								borderWidth={0}
								color="#20ca17"
								animated
								showsText
								formatText={() => `${item.setCount} / 10`}
							/>
						</View>
					)
				}}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<Text style={styles.empty}>No exercises yet</Text>
				}
			/>

			<Text style={styles.title}>Recent Workouts</Text>
			<FlatList
				data={workouts}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => String(item.id)}
				style={styles.list}
				renderItem={({ item }) => {	
					return (
						<View style={styles.workoutContainer}>
							<Text style={styles.workoutNameText}>{item.name}</Text>
							<Text style={styles.workoutText}>{item.duration}</Text>
							<Text style={styles.workoutText}>{formatDate(item.date)}</Text>
						</View>
					)
				}}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<Text style={styles.empty}>No exercises yet</Text>
				}
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
	setCountText: {
		fontSize: 18,
		textAlign: "center",
		margin: "auto",
		marginTop: 4,
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
