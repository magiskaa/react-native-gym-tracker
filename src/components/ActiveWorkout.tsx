import { 
    FlatList, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
} from "react-native";
import { ExerciseRow } from "../services/database";
import { useState } from "react";

type Props = {
    exercises: ExerciseRow[];
    selectedIds: Set<number>;
    expandedId: number | null;
    setExpandedId: (id: number | null) => void;
};

export default function ActiveWorkout({
    exercises,
    selectedIds,
    expandedId,
    setExpandedId
}: Props) {
    const [inputs, setInputs] = useState<Record<number, { reps: string; weight: string }>>({});

    const addSet = () => {

    };

    const updateReps = (id: number, value: string) => {
        setInputs((prev) => ({
            ...prev,
            [id]: {
                reps: value,
                weight: prev[id]?.weight ?? "",
            },
        }));
    };

    const updateWeight = (id: number, value: string) => {
        setInputs((prev) => ({
            ...prev,
            [id]: {
                reps: prev[id]?.reps ?? "",
                weight: value,
            },
        }));
    };

    return (
        <View>
            <FlatList
                data={exercises.filter(ex => selectedIds.has(ex.id))}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isExpanded = expandedId === item.id;

                    return (
                        <Pressable
                            onPress={() =>
                                setExpandedId(isExpanded ? null : item.id)
                            }
                            style={({ pressed }) => [
                                styles.card,
                                pressed && styles.cardPressed,
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {item.muscle_group}
                                </Text>
                            </View>
                            {isExpanded ? (
                                <View style={styles.setsContainer}>
                                    <TextInput
                                        style={styles.setInput}
                                        value={inputs[item.id]?.reps ?? ""}
                                        onChangeText={(value) => updateReps(item.id, value)}
                                        keyboardType="number-pad"
                                        placeholder="Reps"
                                    />
                                    <TextInput
                                        style={styles.setInput}
                                        value={inputs[item.id]?.weight ?? ""}
                                        onChangeText={(value) => updateWeight(item.id, value)}
                                        keyboardType="number-pad"
                                        placeholder="Weight"
                                    />
                                    <Pressable onPress={addSet}>
                                        <Text style={styles.addSet}>+</Text>
                                    </Pressable>
                                </View>
                            ) : null}
                        </Pressable>
                    );
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.empty}>No exercises</Text>
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
		backgroundColor: "#1e1e1e",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
	},
	cardPressed: {
		opacity: 0.8,
	},
	cardHeader: {
		gap: 4,
	},
	cardTitle: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#c7c7c7",
		fontSize: 13,
	},
	setsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#2c2c2c",
	},
    setInput: {
        width: "45%",
        fontSize: 18,
        backgroundColor: "#c7c7c7",
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 5,
        paddingLeft: 5,
        borderRadius: 5,
    },
    addSet: {
        color: "#c7c7c7",
        fontSize: 32,
    },
	listContent: {
		paddingBottom: 24,
	},
    empty: {
		color: "#9a9a9a",
		textAlign: "center",
		marginTop: 12,
	},
});
