import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import { formatDate } from "../../utils/Utils";
import { Workout } from "../../services/workouts";
import { CommonStyles } from "../../styles/CommonStyles";

type Props = {
    workouts: Workout[];
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
                            <View style={styles.accent} />
                            <View style={styles.workoutContent}>
                                <Text style={styles.workoutNameText}>{item.name}</Text>
                                <Text style={styles.workoutText}>{item.duration}</Text>
                                <Text style={styles.workoutMeta}>{formatDate(item.date)}</Text>
                            </View>
                        </View>
                    )
                }}
                contentContainerStyle={[CommonStyles.listContent, { paddingHorizontal: 4 }]}
                ListEmptyComponent={
                    <Text style={[CommonStyles.empty, { marginHorizontal: windowWidth / 2 - 50 }]}>No workouts yet</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        marginTop: 8,
        marginBottom: 8,
        marginHorizontal: 4,
        fontWeight: "700",
        color: "#f1f1f1",
        letterSpacing: 0.3,
    },
	workoutContainer: {
        backgroundColor: "#2b2b2b",
        padding: 12,
        width: 170,
        height: 110,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#393939",
        marginHorizontal: 6,
        marginVertical: 6,
        flexDirection: "row",
        alignItems: "center",
	},
    accent: {
        width: 6,
        height: "70%",
        borderRadius: 6,
        backgroundColor: "#20ca17",
        marginRight: 10,
    },
    workoutContent: {
        flex: 1,
    },
	workoutNameText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f1f1f1",
	},
	workoutText: {
        fontSize: 14,
        marginTop: 6,
        color: "#767676",
    },
    workoutMeta: {
        fontSize: 13,
        marginTop: 2,
        color: "#767676",
	},
});
