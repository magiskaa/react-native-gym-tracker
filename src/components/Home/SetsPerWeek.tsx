import { ActivityIndicator, View, Text, FlatList, StyleSheet } from "react-native";
import { Circle } from "react-native-progress";
import { SetCount } from "../../services/sets";
import { CommonStyles } from "../../styles/CommonStyles";
import { muscleGroupColors, targetSetCounts } from "../../utils/Const";


type Props = {
    setCounts: SetCount[];
    isLoading: boolean;
};

export default function SetsPerWeek({ setCounts, isLoading }: Props) {
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
                                size={68}
                                thickness={5}
                                borderWidth={0}
                                color={muscleGroupColors.get(item.muscleGroup)}
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
                    isLoading ? (
                        <ActivityIndicator size="small" color="#20ca17" />
                    ) : (
                        <Text style={CommonStyles.empty}>No muscle groups to show</Text>
                    )
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
