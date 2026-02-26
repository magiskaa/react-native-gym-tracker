import { useEffect, useState, useRef } from "react";
import { 
    ActivityIndicator, 
    Pressable, 
    StyleSheet, 
    Text, 
    View,
    Alert, 
    Animated, 
    Modal,
    FlatList, 
    Platform,
    UIManager,
    LayoutAnimation,
    TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { CommonStyles } from "../styles/CommonStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { formatDuration } from "../utils/Utils";
import { MenuStyles } from "../styles/MenuStyles";
import { Entypo } from "@expo/vector-icons";
import { useToast } from "../components/ToastConfig";
import { BlurView } from "expo-blur";
import { WorkoutStackParamList } from "../navigation/WorkoutStack";


export default function ActiveWorkoutScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList>>();
    const route = useRoute<RouteProp<WorkoutStackParamList, "ActiveWorkout">>();
    const { exercises, favoriteExercises, selectedIds, setSelectedIds, setIsModalVisible, deleteWorkout, endWorkout } = route.params;
    const { session } = useAuthContext();
    const [error, setError] = useState<string | null>(null);
    const statsNavigation = useNavigation<NavigationProp<ParamListBase>>();

    const startTime = useRef(Date.now() / 1000);
    const [formattedDuration, setFormattedDuration] = useState<string>("0:00:00");
    const [workoutName, setWorkoutName] = useState<string>("");

    const [setsByExercise, setSetsByExercise] = useState<Record<string, { reps: string; weight: string }[]>>({});

    const [favorites, setFavorites] = useState<number[] | null>(favoriteExercises[0].favorites);

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const menuAnim = useRef(new Animated.Value(0)).current;
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const muscleGroupColors = new Map([
		["Chest", "#9f0fca"],
		["Shoulders", "#0c3ed5"],
		["Biceps", "#ffd700"],
		["Triceps", "#47db16"],
		["Legs", "#f00707"],
		["Back", "#2f8507"],
		["Abs", "#ea0a58"]
	]);

    const loadData = async () => {
        if (!session?.user.id) { 
            Alert.alert("Failed to load data", "Please sign in again");
            return; 
        }

        try {
            
        } catch (error) {
            Alert.alert("Failed to load data", "Please try again later");
            console.error(`Failed to load data: ${error}`);
        } finally {

        }
    };

    useEffect(() => {
        loadData();
    }, [session?.user.id]);

    useEffect(() => {
        if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

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
        <View style={CommonStyles.container}>
            <BlurView
                tint="dark"
                intensity={50}
                style={CommonStyles.blurView}
            >
                <View style={[CommonStyles.header, { gap: 8 }]}>
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.goBack();
                        }}
                        style={({ pressed }) => [CommonStyles.backButton, pressed && CommonStyles.buttonPressed]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#f1f1f1" />
                    </Pressable>

                    <Text style={[CommonStyles.headerTitle, { flex: 1 }]}>Active Workout</Text>

                    <Pressable
                        onPress={() => {
                            setIsMenuVisible(false);
                            endWorkout(workoutName || "Workout", formattedDuration, setsByExercise);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={({ pressed }) => [
                            pressed && CommonStyles.buttonPressed && CommonStyles.headerIconPressed,
                            CommonStyles.headerIcon
                        ]}
                    >
                        <Entypo name="check" size={24} color="#f1f1f1" />
                    </Pressable>
                
                    <Pressable
                        onPress={() => {
                            openMenu();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={({ pressed }) => [
                            pressed && CommonStyles.buttonPressed && CommonStyles.headerIconPressed,
                            CommonStyles.headerIcon
                        ]}
                    >
                        <Entypo name="dots-three-vertical" size={24} color="#f1f1f1" />
                    </Pressable>
                </View>
            </BlurView>

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
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                            }}
                            style={({ pressed }) => [
                                MenuStyles.menuItem,
                                pressed && CommonStyles.buttonPressed
                            ]}
                        >
                            <Text style={MenuStyles.menuText}>Edit</Text>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>

            <FlatList
                data={exercises ? exercises.filter(ex => selectedIds.has(ex.id)) : []}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isExpanded = expandedId === item.id;

                    return (
                        <Pressable
                            onPress={() => {
                                runLayoutAnimation();
                                setExpandedId(isExpanded ? null : item.id);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            style={({ pressed }) => [
                                CommonStyles.componentContainer,
                                pressed && CommonStyles.buttonPressed,
                                { 
                                    marginBottom: isExpanded ? 32 : 13,
                                    marginTop: isExpanded ? 19 : 0
                                }
                            ]}
                        >
                            <View style={[styles.flexRow, { justifyContent: "flex-start" }]}>
                                <View style={[styles.accent, { backgroundColor: muscleGroupColors.get(item.muscleGroup) }]} />
                                <View style={styles.cardTitles}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <Text style={styles.cardSubtitle}>{item.muscleGroup}</Text>
                                </View>

                                {isExpanded ? (
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            statsNavigation.navigate("Stats", {
                                                screen: "StatsList",
                                                params: {
                                                    openExercise: {
                                                        exerciseId: item.id,
                                                        name: item.name,
                                                        muscleGroup: item.muscleGroup,
                                                        eliteBWRatio: item.eliteBWRatio,
                                                        eliteReps: item.eliteReps,
                                                        favoriteExercises: favoriteExercises[0],
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
                                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

            <View style={[CommonStyles.componentContainer, styles.durationContainer]}>
                <Text style={styles.durationText}>{formattedDuration}</Text>
            </View>
        </View>
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
        marginBottom: 0,
        fontWeight: "500",
        flex: 1,
    },
    flexRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    accent: {
        width: 6,
        height: "90%",
        borderRadius: 6,
        backgroundColor: "#20ca17",
        marginRight: 10,
    },
	cardTitles: {
		gap: 2,
        flex: 1
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
        paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#393939",
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
    durationContainer: { 
        position: "absolute", 
        bottom: 100, 
        width: "100%", 
        left: 16, 
        borderColor: "#20ca17", 
        opacity: 0.9,
        paddingVertical: 8,
    },
    durationText: {
        fontSize: 38,
        color: "#20ca17",
        margin: "auto",
    },
    endButton: {
        borderRadius: 999,
		borderWidth: 1,
        borderColor: "#20ca17",
		paddingVertical: 6,
		paddingHorizontal: 12,
        width: "20%",
    },
	listContent: {
        paddingTop: 80,
		paddingBottom: "100%",
	},
});
