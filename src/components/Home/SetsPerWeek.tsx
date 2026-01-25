import { View, Text, FlatList, StyleSheet } from "react-native";
import { Circle } from "react-native-progress";
import { SetCount } from "../../services/database";

type Props = {
    setCounts: SetCount[];
};

export default function SetsPerWeek({ setCounts }: Props) {
    return (
        <View>
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
