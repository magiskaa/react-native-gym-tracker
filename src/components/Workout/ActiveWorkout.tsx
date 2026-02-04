import { 
    FlatList, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import * as Haptics from 'expo-haptics';
import { addWorkout } from "../../services/workouts";
import { addWorkoutExercise } from "../../services/workoutExercises";
import { addSet } from "../../services/sets";
import { Exercise } from "../../services/exercises"
import { useEffect, useState } from "react";
import { formatLocalDateISO, formatDuration } from "../../utils/Utils";
import { CommonStyles } from "../../styles/CommonStyles";
import { useAuthContext } from "../../auth/UseAuthContext";
import { useToast } from "../ToastConfig";


type Props = {
    exercises: Exercise[] | null;
    selectedIds: Set<number>;
    expandedId: number | null;
    setExpandedId: (id: number | null) => void;
    setIsModalVisible: (visible: boolean) => void;
    setIsWorkoutActive: (active: boolean) => void;
    setSelectedIds: (ids: Set<number>) => void;
};

export default function ActiveWorkout({
    exercises,
    selectedIds,
    expandedId,
    setExpandedId,
    setIsModalVisible,
    setIsWorkoutActive,
    setSelectedIds
}: Props) {
    const { session } = useAuthContext();
    const [startTime, setStartTime] = useState<number>(Date.now() / 1000);
    const [formattedDuration, setFormattedDuration] = useState<string>("0:00:00");
    
    const [setsByExercise, setSetsByExercise] = useState<Record<string, { reps: string; weight: string }[]>>({});
    const [name, setName] = useState<string>("");

    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        setSetsByExercise((prev) => {
            if (!exercises) { return prev; }

            const next: Record<string, { reps: string; weight: string }[]> = {};
            const selectedExercises = exercises.filter((ex) => selectedIds.has(ex.id));

            selectedExercises.forEach((ex) => {
                next[ex.id] = prev[ex.id] ?? [{ reps: "", weight: "" }];
            });

            return next;
        });
    }, [exercises, selectedIds]);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() / 1000 - startTime;
            setFormattedDuration(formatDuration(elapsed));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const addSetRow = (exerciseId: number) => {
        setValidationError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: [...(prev[exerciseId] ?? []), { reps: "", weight: "" }],
        }));
    };

    const removeSet = (exerciseId: number, index: number) => {
        setValidationError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: (prev[exerciseId] ?? []).filter((_, i) => i !== index),
        }));
    };

    const updateReps = (exerciseId: number, index: number, value: string) => {
        setValidationError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: (prev[exerciseId] ?? []).map((set, i) =>
                i === index ? { ...set, reps: value } : set
            ),
        }));
    };

    const updateWeight = (exerciseId: number, index: number, value: string) => {
        setValidationError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: (prev[exerciseId] ?? []).map((set, i) =>
                i === index ? { ...set, weight: value } : set
            ),
        }));
    };

    const deleteWorkout = () => {
        setIsWorkoutActive(false);
        setSelectedIds(new Set());
        useToast("success", "Workout deleted", "Your workout was deleted succesfully");
    };

    const editExercises = () => {
        setIsModalVisible(true);
    };

    const endWorkout = async () => {
        if (!exercises) {
            setValidationError("No exercises selected");
            return;
        }

        const selectedExercises = exercises.filter((ex) => selectedIds.has(ex.id));
        const hasInvalidSet = selectedExercises.some((exercise) => {
            const sets = setsByExercise[exercise.id] ?? [];

            if (sets.length === 0) {
                return true;
            }

            return sets.some((set) => !set.reps.trim() || !set.weight.trim());
        });

        if (hasInvalidSet) {
            setValidationError("Fill reps and weight for all sets");
            return;
        }

        try {
            if (!session?.user.id) {
                useToast("error", "No user id found", "Please log in again");
                return;
            }

            const date = formatLocalDateISO(new Date());
            const duration = formattedDuration;
            const workoutName = name.trim() || "Workout";

            const workoutId = await addWorkout(session.user.id, workoutName, duration, date);
            if (!workoutId) {
                useToast("error", "Adding workout failed", "Please try again");
                return;
            }

            for (const exercise of selectedExercises) {
                const workoutExerciseId = await addWorkoutExercise(workoutId, exercise.id);
                if (!workoutExerciseId) {
                    useToast("error", "Adding workout exercise failed", "Please try again");
                    return;
                }

                const sets = setsByExercise[exercise.id] ?? [];
                for (const set of sets) {
                    const reps = Number(set.reps);
                    const weight = Number(set.weight.replace(",", "."));

                    if (Number.isNaN(reps) || Number.isNaN(weight)) {
                        continue;
                    }

                    await addSet(workoutExerciseId, reps, weight);
                }
            }

            setIsWorkoutActive(false);
            setSelectedIds(new Set());
            useToast("success", "Workout logged", "Your workout was added succesfully");

        } catch (error) {
            Alert.alert("Failed to save workout", "Please try again");
            console.error("Failed to save workout", error);
        }
    };
    

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[CommonStyles.container, { padding: 0 }]}>

                <View style={styles.headerContainer}>
                    <TextInput 
                        style={styles.nameInput}
                        value={name}
                        onChangeText={(value) => setName(value)}
                        placeholder="Workout name"
                        selectionColor="#20ca17"
                        cursorColor="#20ca17"
                    />
                </View>

                {validationError ? (
                    <Text style={CommonStyles.error}>{validationError}</Text>
                ) : null}

                <FlatList
                    data={exercises ? exercises.filter(ex => selectedIds.has(ex.id)) : []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isExpanded = expandedId === item.id;

                        return (
                            <Pressable
                                onPress={() => {
                                    setExpandedId(isExpanded ? null : item.id);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed,
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitles}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                        <Text style={styles.cardSubtitle}>
                                            {item.muscleGroup}
                                        </Text>
                                    </View>

                                    {isExpanded ? (
                                        <View style={styles.cardStats}>
                                            <Text style={styles.repsPerSet}>R/S: 14.33</Text>
                                            <Text style={styles.avgWeight}>~W: 35</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {isExpanded ? (
                                    <View style={styles.setsContainer}>
                                        {(setsByExercise[item.id] ?? []).map((set, index) => (
                                            <View style={styles.setRow} key={`${item.id}-${index}`}>
                                                <TextInput
                                                    style={styles.setInput}
                                                    value={set.reps}
                                                    onChangeText={(value) =>
                                                        updateReps(item.id, index, value)
                                                    }
                                                    keyboardType="number-pad"
                                                    placeholder="Reps"
                                                    
                                                />
                                                <TextInput
                                                    style={styles.setInput}
                                                    value={set.weight}
                                                    onChangeText={(value) =>
                                                        updateWeight(item.id, index, value)
                                                    }
                                                    keyboardType="numeric"
                                                    placeholder="Weight"
                                                />
                                                <Pressable
                                                    onPress={() => { removeSet(item.id, index); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                                                    style={styles.removeSetButton}
                                                >
                                                    <Text style={styles.removeSetText}>Remove</Text>
                                                </Pressable>
                                            </View>
                                        ))}
                                        <Pressable
                                            onPress={() => { addSetRow(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                                            style={styles.addSetButton}
                                        >
                                            <Text style={styles.addSet}>+ Add set</Text>
                                        </Pressable>
                                    </View>
                                ) : null}
                            </Pressable>
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={CommonStyles.empty}>No exercises</Text>
                    }
                />

                <View style={styles.footerContainer}>
                    <Text style={styles.durationText}>{formattedDuration}</Text>
                    <Pressable 
                        style={styles.footerButton}
                        onPress={() => { 
                            Alert.alert(
                                "Delete workout?", "Are you sure you want to delete this workout?", 
                                [{ text: "No", style: "cancel" }, { text: "Yes", onPress: deleteWorkout }],
                                { cancelable: true }
                            ); 
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                        }}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </Pressable>
                    <Pressable 
                        style={styles.footerButton}
                        onPress={() => { editExercises(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                    >
                        <Text style={styles.buttonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                        style={styles.footerButton}
                        onPress={() => { endWorkout(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                    >
                        <Text style={styles.buttonText}>End</Text>
                    </Pressable>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    headerContainer: {
        marginTop: 8,
        marginBottom: 9,
        borderBottomWidth: 1,
        borderBottomColor: "#2c2c2c",
        paddingBottom: 20,
    },
    nameInput: {
        fontSize: 22,
        backgroundColor: "#c7c7c7",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        color: "#2a2a2a"
    },
    card: {
		backgroundColor: "#2b2b2b",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
	},
	cardPressed: {
		opacity: 0.8,
	},
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
	cardTitles: {
		gap: 4,
	},
	cardTitle: {
		color: "#f1f1f1",
		fontSize: 16,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#767676",
		fontSize: 13,
	},
    cardStats: {
        flexDirection: "row",
        gap: 8,
    },
    repsPerSet: {
        color: "#f1f1f1",
    },
    avgWeight: {
        color: "#f1f1f1",
    },
	setsContainer: {
        gap: 10,
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#2b2b2b",
	},
    setRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    setInput: {
        flex: 1,
        fontSize: 18,
        backgroundColor: "#c7c7c7",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    addSetButton: {
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#20ca17",
    },
    addSet: {
        color: "#20ca17",
        fontWeight: "600",
    },
    removeSetButton: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: "#1e1e1e",
    },
    removeSetText: {
        color: "#c7c7c7",
        fontSize: 12,
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#2b2b2b",
        paddingTop: 14,
    },
    durationText: {
        fontSize: 32,
        color: "#f1f1f1",
        width: "28%"
    },
    footerButton: {
        borderRadius: 999,
		borderWidth: 1,
        borderColor: "#20ca17",
		paddingVertical: 6,
		paddingHorizontal: 12,
        width: "20%",
    },
    buttonText: {
        color: "#20ca17",
        textAlign: "center",
    },
	listContent: {
		paddingBottom: 24,
	},
});
