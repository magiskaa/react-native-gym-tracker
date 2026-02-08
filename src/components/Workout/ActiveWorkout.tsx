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
    Modal,
    LayoutAnimation,
    Platform,
    UIManager,
    Animated
} from "react-native";
import * as Haptics from 'expo-haptics';
import { addWorkout } from "../../services/workouts";
import { addWorkoutExercise } from "../../services/workoutExercises";
import { addSet } from "../../services/sets";
import { Exercise } from "../../services/exercises"
import { useEffect, useRef, useState } from "react";
import { formatLocalDateISO, formatDuration } from "../../utils/Utils";
import { CommonStyles } from "../../styles/CommonStyles";
import { useAuthContext } from "../../auth/UseAuthContext";
import { useToast } from "../ToastConfig";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MenuStyles } from "../../styles/MenuStyles";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";


type Props = {
    exercises: Exercise[] | null;
    error: string | null;
    selectedIds: Set<number>;
    expandedId: number | null;
    setError: (error: string | null) => void;
    setExpandedId: (id: number | null) => void;
    setIsModalVisible: (visible: boolean) => void;
    setIsWorkoutActive: (active: boolean) => void;
    setSelectedIds: (ids: Set<number>) => void;
};

export default function ActiveWorkout({
    exercises,
    error,
    selectedIds,
    expandedId,
    setError,
    setExpandedId,
    setIsModalVisible,
    setIsWorkoutActive,
    setSelectedIds
}: Props) {
    useEffect(() => {
        if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const { session } = useAuthContext();
    const startTime = useRef(Date.now() / 1000);
    const [formattedDuration, setFormattedDuration] = useState<string>("0:00:00");
    
    const [setsByExercise, setSetsByExercise] = useState<Record<string, { reps: string; weight: string }[]>>({});
    const [name, setName] = useState<string>("");

    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
    const menuAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

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
            const elapsed = Date.now() / 1000 - startTime.current;
            setFormattedDuration(formatDuration(elapsed));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const addSetRow = (exerciseId: number) => {
        setError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: [...(prev[exerciseId] ?? []), { reps: "", weight: "" }],
        }));
    };

    const removeSet = (exerciseId: number, index: number) => {
        setError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: (prev[exerciseId] ?? []).filter((_, i) => i !== index),
        }));
    };

    const updateReps = (exerciseId: number, index: number, value: string) => {
        setError(null);
        setSetsByExercise((prev) => ({
            ...prev,
            [exerciseId]: (prev[exerciseId] ?? []).map((set, i) =>
                i === index ? { ...set, reps: value } : set
            ),
        }));
    };

    const updateWeight = (exerciseId: number, index: number, value: string) => {
        setError(null);
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

    const endWorkout = async () => {
        if (!exercises) {
            setError("No exercises selected");
            return;
        }

        const selectedExercises = exercises.filter((ex) => selectedIds.has(ex.id));
        const hasInvalidSet = selectedExercises.some((exercise) => {
            const sets = setsByExercise[exercise.id] ?? [];

            if (sets.length === 0) {
                return true;
            }

            const noRepsOrWeight = sets.some((set) => !set.reps.trim() || !set.weight.trim());
            const invalidRepsOrWeight = sets.some((set) => Number(set.reps.trim()) > 500 || Number(set.weight.trim()) > 1000);

            return noRepsOrWeight || invalidRepsOrWeight;
        });

        if (hasInvalidSet) {
            setError("You have not entered reps and weight for all sets, or some fields have invalid inputs");
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

    const openMenu = () => {
        menuAnim.setValue(0);
        setIsMenuVisible(true);
        Animated.spring(menuAnim, {
            toValue: 1,
            friction: 10,
            tension: 140,
            useNativeDriver: true,
        }).start();
	};

	const closeMenu = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsMenuVisible(false);
            }
        });
	};

    const runLayoutAnimation = () => {
        LayoutAnimation.configureNext({
            duration: 400,
            create: {
                type: LayoutAnimation.Types.spring,
                property: LayoutAnimation.Properties.scaleY,
                springDamping: 0.9,
            },
            update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 0.9,
            },
            delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.scaleY,
                duration: 50,
            },
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <View style={CommonStyles.header}>
                    <Text style={CommonStyles.title}>Workout in progress</Text>
                    <Text style={[styles.durationText, { color: "#20ca17" }]}>{formattedDuration}</Text>
                    <Pressable
                        onPress={() => {
                            openMenu();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        style={({ pressed }) => [
                            pressed && CommonStyles.buttonPressed
                        ]}
                    >
                        <Entypo name="dots-three-vertical" size={24} color="#f1f1f1" />
                    </Pressable>
                </View>

                <TextInput 
                    style={[CommonStyles.input, styles.nameInput]}
                    value={name}
                    onChangeText={(value) => setName(value)}
                    placeholder="Workout name"
                    selectionColor="#20ca17"
                    cursorColor="#1e1e1e"
                />

                {error ? <Text style={CommonStyles.error}>{error}</Text> : null}

                <FlatList
                    data={exercises ? exercises.filter(ex => selectedIds.has(ex.id)) : []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isExpanded = expandedId === item.id;

                        return (
                            <Pressable
                                onPress={() => {
                                    runLayoutAnimation();
                                    setExpandedId(isExpanded ? null : item.id);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                                style={({ pressed }) => [
                                    CommonStyles.componentContainer,
                                    pressed && CommonStyles.buttonPressed,
                                    { 
                                        marginBottom: isExpanded ? 22 : 13,
                                        marginTop: isExpanded ? 9 : 0
                                    }
                                ]}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitles}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                        <Text style={styles.cardSubtitle}>{item.muscleGroup}</Text>
                                    </View>

                                    {isExpanded ? (
                                        <Pressable
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                navigation.navigate("Stats", {
                                                    screen: "StatsList",
                                                    params: {
                                                        openExercise: {
                                                            exerciseId: item.id,
                                                            name: item.name,
                                                            muscleGroup: item.muscleGroup,
                                                            eliteBWRatio: item.eliteBWRatio,
                                                            eliteReps: item.eliteReps,
                                                        },
                                                    },
                                                });
                                            }}
                                        >
                                            <Ionicons name="chevron-forward" size={18} color="#6f6f6f" style={{ padding: 9 }} />
                                        </Pressable>
                                    ) : null}
                                </View>

                                {isExpanded ? (
                                    <View style={styles.setsContainer}>
                                        {(setsByExercise[item.id] ?? []).map((set, index) => (
                                            <View style={styles.setRow} key={`${item.id}-${index}`}>
                                                <TextInput
                                                    style={[CommonStyles.input, styles.setInput]}
                                                    value={set.reps}
                                                    onChangeText={(value) =>
                                                        updateReps(item.id, index, value)
                                                    }
                                                    keyboardType="number-pad"
                                                    placeholder="Reps"
                                                    
                                                />
                                                <TextInput
                                                    style={[CommonStyles.input, styles.setInput]}
                                                    value={set.weight}
                                                    onChangeText={(value) =>
                                                        updateWeight(item.id, index, value)
                                                    }
                                                    keyboardType="numeric"
                                                    placeholder="Weight"
                                                />
                                                <Pressable
                                                    onPress={() => { 
                                                        runLayoutAnimation();
                                                        removeSet(item.id, index);
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                    }}
                                                    style={styles.removeSetButton}
                                                >
                                                    <Text style={styles.removeSetText}>Remove</Text>
                                                </Pressable>
                                            </View>
                                        ))}
                                        <Pressable
                                            onPress={() => {
                                                runLayoutAnimation();
                                                addSetRow(item.id);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            }}
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

                <Pressable
                    style={({ pressed }) => [
                        CommonStyles.button, { width: "100%" },
                        pressed && CommonStyles.buttonPressed
                    ]}
                    onPress={() => {
                        Alert.alert(
                            "End workout?", "Are you done with this workout?", 
                            [{ text: "No", style: "cancel" }, { text: "Yes", onPress: endWorkout }],
                            { cancelable: true }
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                    }}
                >
                    <Text style={CommonStyles.buttonText}>End workout</Text>
                </Pressable>
                
                <Modal
                    transparent
                    visible={isMenuVisible}
                    animationType="fade"
                    onRequestClose={closeMenu}
                >
                    <Pressable style={MenuStyles.menuOverlay} onPress={closeMenu}>
                        <Animated.View
                            style={[
                                MenuStyles.menu,
                                {
                                    opacity: menuAnim,
                                    transform: [{ scale: menuAnim }],
                                }
                            ]}
                        >
                            <Pressable 
                                onPress={() => { 
                                    Alert.alert(
                                        "Delete workout?", "Are you sure you want to delete this workout?", 
                                        [{ text: "No", style: "cancel" }, { text: "Yes", onPress: deleteWorkout }],
                                        { cancelable: true }
                                    );
                                    setIsMenuVisible(false);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                                style={({ pressed }) => [
                                    MenuStyles.menuItem,
                                    pressed && CommonStyles.buttonPressed
                                ]}
                            >
                                <Text style={MenuStyles.menuText}>Delete</Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => {
                                    setIsMenuVisible(false);
                                    setIsModalVisible(true);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                                }}
                                style={({ pressed }) => [
                                    MenuStyles.menuItem,
                                    pressed && CommonStyles.buttonPressed,
                                    { borderBottomWidth: 0 }
                                ]}
                            >
                                <Text style={MenuStyles.menuText}>Edit</Text>
                            </Pressable>
                        </Animated.View>
                    </Pressable>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    nameInput: {
        fontSize: 20,
        backgroundColor: "#acacac",
        color: "#1e1e1e",
        marginTop: 8,
        marginBottom: 16,
        fontWeight: "500",
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
		fontSize: 18,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#767676",
		fontSize: 15,
	},
	setsContainer: {
        gap: 10,
		marginTop: 16,
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
        fontSize: 16,
        backgroundColor: "#acacac",
        marginBottom: 0,
        color: "#1e1e1e",
        fontWeight: "500",
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
        borderWidth: 1,
        borderColor: "#393939"
    },
    removeSetText: {
        color: "#acacac",
        fontSize: 12,
    },
    durationText: {
        fontSize: 32,
        color: "#f1f1f1",
        width: "28%"
    },
    endButton: {
        borderRadius: 999,
		borderWidth: 1,
        borderColor: "#20ca17",
		paddingVertical: 6,
		paddingHorizontal: 12,
        width: "20%",
    },
    endText: {
        color: "#20ca17",
        textAlign: "center",
    },
	listContent: {
		paddingBottom: 120,
	},
});
