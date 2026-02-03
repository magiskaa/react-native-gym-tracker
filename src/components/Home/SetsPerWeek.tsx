import { View, Text, FlatList, StyleSheet } from "react-native";
import { Circle } from "react-native-progress";
import { SetCount } from "../../services/sets";
import { CommonStyles } from "../../styles/CommonStyles";

type Props = {
    setCounts: SetCount[];
};

export default function SetsPerWeek({ setCounts }: Props) {
    return (
        <View>
            <Text style={CommonStyles.title}>Sets / Week</Text>
            <FlatList
                data={setCounts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.muscleGroup}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    return (
                        <View style={styles.setsPerWeekContainer}>
                            <Text style={styles.muscleGroupText}>{item.muscleGroup}</Text>
                            <Circle 
                                progress={(item.setCount / 10) > 1 ? 1 : (item.setCount / 10)}
                                size={84}
                                thickness={3}
                                borderWidth={0}
                                color={item.setCount >= 10 ? "#20ca17" : "#4a9eff"}
                                animated
                                showsText
                                formatText={() => `${item.setCount} / 10`}
                            />
                        </View>
                    )
                }}
                contentContainerStyle={[CommonStyles.listContent, { paddingHorizontal: 8 }]}
                ListEmptyComponent={
                    <Text style={CommonStyles.empty}>No exercises yet</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
	setsPerWeekContainer: {
		backgroundColor: "#2b2b2b",
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
        color: "#f1f1f1"
	},
});
