import { ActivityIndicator, View, Text, FlatList, StyleSheet } from "react-native";
import { formatDate } from "../../utils/Utils";
import { Workout } from "../../services/workouts";
import { CommonStyles } from "../../styles/CommonStyles";

type Props = {
    workouts: Workout[];
    isLoading: boolean;
};

export default function RecentWorkouts({ workouts, isLoading }: Props) {
    return (
        <View>
            <FlatList
                data={workouts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    return (
                        <View style={[CommonStyles.componentContainer, styles.workoutContainer]}>
                            <View style={[CommonStyles.accent, { height: "70%", backgroundColor: "#20ca17" }]} />
                            <View style={styles.workoutContent}>
                                <Text style={styles.workoutNameText}>{item.name}</Text>
                                <Text style={styles.workoutText}>{item.duration}</Text>
                                <Text style={styles.workoutMeta}>{formatDate(item.date)}</Text>
                            </View>
                        </View>
                    )
                }}
                contentContainerStyle={CommonStyles.listContent}
                ListEmptyComponent={
                    isLoading ? (
                        <ActivityIndicator size="small" color="#20ca17" />
                    ) : (
                        <Text style={CommonStyles.empty}>No workouts yet</Text>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
	workoutContainer: {
        width: 170,
        height: 110,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
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
        fontSize: 16,
        marginTop: 6,
        color: "#767676",
    },
    workoutMeta: {
        fontSize: 14,
        marginTop: 2,
        color: "#767676",
	},
});
