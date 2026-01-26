import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import { formatDate } from "../../utils/Utils";
import { WorkoutRow } from "../../services/database";
import { CommonStyles } from "../../styles/CommonStyles";

type Props = {
    workouts: WorkoutRow[];
};

export default function RecentWorkouts({ workouts }: Props) {
    const windowWidth = Dimensions.get("window").width;

    return (
        <View>
            <Text style={styles.title}>Recent Workouts</Text>
            <FlatList
                data={workouts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    return (
                        <View style={styles.workoutContainer}>
                            <Text style={styles.workoutNameText}>{item.name}</Text>
                            <Text style={styles.workoutText}>{item.duration}</Text>
                            <Text style={styles.workoutText}>{formatDate(item.date)}</Text>
                        </View>
                    )
                }}
                contentContainerStyle={[CommonStyles.listContent, { paddingHorizontal: 8 }]}
                ListEmptyComponent={
                    <Text style={[CommonStyles.empty, { marginHorizontal: windowWidth / 2 - 50 }]}>No workouts yet</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        marginTop: 24,
		marginBottom: 8,
		marginHorizontal: 12,
        fontWeight: "600",
        color: "#f1f1f1",
    },
	workoutContainer: {
		backgroundColor: "#2b2b2b",
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
		color: "#f1f1f1",
	},
	workoutText: {
		fontSize: 18,
		textAlign: "center",
		margin: "auto",
		marginBottom: 2,
		color: "#f1f1f1",

	},
});
