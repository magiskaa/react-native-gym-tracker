import { View, Text, FlatList, StyleSheet } from "react-native";
import { formatDate } from "../../utils/Utils";
import { WorkoutRow } from "../../services/database";

type Props = {
    workouts: WorkoutRow[];
};

export default function RecentWorkouts({ workouts }: Props) {
    return (
        <View>
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
    title: {
        fontSize: 24,
        marginTop: 24,
		marginBottom: 4,
		marginHorizontal: 12,
        fontWeight: "600",
        color: "#1e1e1e",
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
