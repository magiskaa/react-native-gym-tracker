import { View, Text, FlatList, StyleSheet } from "react-native";
import { Circle } from "react-native-progress";
import { SetCount } from "../../services/sets";
import { CommonStyles } from "../../styles/CommonStyles";

type Props = {
    setCounts: SetCount[];
};

export default function SetsPerWeek({ setCounts }: Props) {
    const targetSetCounts = new Map([
        ["Rinta", 9], 
        ["Olkapäät", 7], 
        ["Hauis", 9], 
        ["Ojentajat", 9], 
        ["Jalat", 22], 
        ["Selkä", 14], 
        ["Vatsat", 9]
    ]);

    return (
        <View>
            <FlatList
                data={setCounts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.muscleGroup}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    const target = targetSetCounts.get(item.muscleGroup) || 10;
                    return (
                        <View style={[CommonStyles.componentContainer, styles.setsPerWeekContainer]}>
                            <Text style={styles.muscleGroupText}>{item.muscleGroup}</Text>
                            <Circle 
                                progress={Math.min(item.setCount / target, 1)}
                                size={84}
                                thickness={5}
                                borderWidth={0}
                                color={item.setCount >= target ? "#20ca17" : "#4a9eff"}
                                animated
                                showsText
                                textStyle={{ fontSize: 22 }}
                                formatText={() => `${item.setCount} / ${target}`}
                            />
                        </View>
                    )
                }}
                contentContainerStyle={CommonStyles.listContent}
                ListEmptyComponent={
                    <Text style={CommonStyles.empty}>No exercises yet</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
	setsPerWeekContainer: {
        marginRight: 8,
	},
	muscleGroupText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 12,
        color: "#f1f1f1",
        fontWeight: "600",
	},
});
