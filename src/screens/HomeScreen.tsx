import { StyleSheet, Text, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { SetCount, getSetCountForCurrentWeek } from "../services/database";

export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);

	const loadData = async () => {
		try {
			const setData = await getSetCountForCurrentWeek();
			setSetCounts(setData);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		loadData();
	},[])

	return (
		<View style={styles.container}>
			<FlatList
				data={setCounts}
				keyExtractor={(item) => item.muscle_group}
				renderItem={({ item }) => {	
					return (
						<View style={styles.setsPerWeekContainer}>
							<Text style={styles.muscleGroupText}>{item.muscle_group}</Text>
							<Text style={styles.setCountText}>{item.setCount} / 10</Text>
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
		alignItems: "center",
	},
	setsPerWeekContainer: {
		backgroundColor: "#dcdcdc",
		padding: 8,
		width: 100,
		height: 100,
		borderRadius: 999,
		marginHorizontal: 4,
		marginVertical: 12,
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
		flexDirection: "row",
		paddingBottom: 24,
	},
	empty: {
		color: "#6b6b6b",
		textAlign: "center",
		marginTop: 24,
	},
});
