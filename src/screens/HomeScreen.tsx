import { StyleSheet, Text, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { SetCount, getSetCountForCurrentWeek } from "../services/database";
import { Circle } from "react-native-progress";

export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
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
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		loadData();
	},[])

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Sets / Week</Text>
			<FlatList
				data={setCounts}
				horizontal
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.muscle_group}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
    title: {
        fontSize: 22,
        marginTop: 20,
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
	listContent: {
		paddingVertical: 12,
		paddingHorizontal: 8,
	},
	empty: {
		color: "#6b6b6b",
		textAlign: "center",
		marginTop: 24,
	},
});
