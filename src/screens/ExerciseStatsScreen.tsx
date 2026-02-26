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
    Switch, 
    FlatList 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import ExerciseChart from "../components/Stats/ExerciseChart";
import { CommonStyles } from "../styles/CommonStyles";
import { ExerciseSession, getExerciseHistory, getExerciseLastSession, getExerciseSessions } from "../services/exercises";
import { StatsStackParamList } from "../navigation/StatsStack";
import { useAuthContext } from "../auth/UseAuthContext";
import { getWeightHistory } from "../services/weights";
import { 
    calculateOneRepMax, 
    calculateStrengthScoreBWRatio, 
    calculateStrengthScoreReps, 
    formatDateWOZeros, 
    formatLocalDateISO 
} from "../utils/Utils";
import { MenuStyles } from "../styles/MenuStyles";
import { Entypo } from "@expo/vector-icons";
import { updateFavoriteExercises } from "../services/favoriteExercises";
import { useToast } from "../components/ToastConfig";


export default function ExerciseStatsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();
    const route = useRoute<RouteProp<StatsStackParamList, "ExerciseStats">>();
    const { exerciseId, name, muscleGroup, eliteBWRatio, eliteReps, favoriteExercises } = route.params;
    const { session } = useAuthContext();

    const [history, setHistory] = useState<{ date: string; avgReps: number; avgWeight: number }[]>([]);
    const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>([]);
    const [favorites, setFavorites] = useState<number[] | null>(favoriteExercises.favorites);

    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
    const [isSessionsLoading, setIsSessionsLoading] = useState<boolean>(false);
    const [isRSILoading, setIsRSILoading] = useState<boolean>(true);

    const [strengthScore, setStrengthScore] = useState<number>(0);
    const [oneRepMax, setOneRepMax] = useState<number>(0);
    const [maxReps, setMaxReps] = useState<number>(0);
    const [userWeight, setUserWeight] = useState<number>(0);
    const [elite, setElite] = useState<number>(0);
    const [isFemaleIndex, setIsFemaleIndex] = useState<boolean>(false);

    const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
    const menuAnim = useRef(new Animated.Value(0)).current;

    const [activeTab, setActiveTab] = useState<number>(1);

    const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        try {
            setIsHistoryLoading(true);
            
            const historyData = await getExerciseHistory(exerciseId);
            setHistory(historyData || []);

            setIsSessionsLoading(true);

            const sessionsData = await getExerciseSessions(exerciseId);
            setExerciseSessions(sessionsData || []);

            setIsRSILoading(true);

            const today = new Date();
            let month = today.getMonth() - 1;
            let year = today.getFullYear();
            if (month < 0) {
                month = 11;
                year -= 1;
            }
            today.setMonth(month);
            today.setFullYear(year);

            const weights = await getWeightHistory(session.user.id, formatLocalDateISO(today));
            const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
            setUserWeight(currentWeight);

            const lastSessionSets = await getExerciseLastSession(exerciseId);

            let max1RM = 0;
            let maxR = 0;
            let score = 0;
            let scaledElite = 0;

            if (lastSessionSets && currentWeight > 0) {
                if (eliteBWRatio) {
                    lastSessionSets.forEach((set: any) => {
                        const e1rm = calculateOneRepMax(set.weight, set.reps);
                        if (e1rm > max1RM) { max1RM = e1rm };
                    });
                    setOneRepMax(max1RM);
                    ({ score, scaledElite } = calculateStrengthScoreBWRatio(max1RM, currentWeight, eliteBWRatio, isFemaleIndex));
                }

                else if (eliteReps) {
                    lastSessionSets.forEach((set: any) => {
                        if (set.reps > maxR) { maxR = set.reps };
                    });
                    setMaxReps(maxR);
                    ({ score, scaledElite } = calculateStrengthScoreReps(maxR, currentWeight, eliteReps, isFemaleIndex));
                }
                setStrengthScore(score);
                setElite(scaledElite);
            }

        } catch (error) {
            Alert.alert("Failed to load data", "Please try again later");
            console.error(`Failed to load data: ${error}`);
            setHistory([]);
        } finally {
            setIsHistoryLoading(false);
            setIsSessionsLoading(false);
            setIsRSILoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [exerciseId, isFemaleIndex]);

    const addToFavorites = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to add to favorites", "Please sign in again");
			return; 
		}

        try {
            const updatedFavorites = [...(favorites || []), exerciseId];
            setFavorites(updatedFavorites);

            await updateFavoriteExercises(session.user.id, updatedFavorites);
            useToast("success", "Added to favorites", "This exercise was added to your favorites succesfully", 1200);

        } catch (error) {
			useToast("error", "Failed to add to favorites", "Please try again" );
            console.error(`Failed to add to favorites: ${error}`);
        }
    };

    const removeFromFavorites = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to remove from favorites", "Please sign in again");
			return; 
		}

        try {
            const updatedFavorites = [...(favorites || []).filter(favorite => favorite !== exerciseId)];
            setFavorites(updatedFavorites);

            await updateFavoriteExercises(session.user.id, updatedFavorites);
            useToast("success", "Removed from favorites", "This exercise was removed from your favorites succesfully", 1200);

        } catch (error) {
			useToast("error", "Failed to remove from favorites", "Please try again" );
            console.error(`Failed to remove from: ${error}`);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 95) return "#1e90ff";  // Elite
        if (score >= 75) return "#1fc41f";  // Advanced
        if (score >= 50) return "#9acd32";  // Intermediate
        if (score >= 35) return "#ffd700";  // Novice
        if (score >= 20) return "#ff8c00";  // Beginner lifter
        return "#dc143c";                   // Non-lifter
    };

    const openHelp = () => {
        menuAnim.setValue(0);
        setIsHelpVisible(true);
        Animated.spring(menuAnim, {
            toValue: 1,
            friction: 10,
            tension: 140,
            useNativeDriver: true,
        }).start();
    };

    const closeHelp = () => {
        Animated.timing(menuAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsHelpVisible(false);
            }
        });
    };

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        navigation.goBack();
                    }}
                    style={({ pressed }) => [styles.backButton, pressed && CommonStyles.buttonPressed]}
                >
                    <Ionicons name="arrow-back" size={24} color="#f1f1f1" />
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.title}>{name}</Text>
                    <Text style={styles.subtitle}>{muscleGroup}</Text>
                </View>

                {favorites?.includes(exerciseId) ? (
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            removeFromFavorites();
                        }}
                        style={({ pressed }) => [pressed && CommonStyles.buttonPressed, { padding: 8 }]}
                    >
                        <Entypo name="heart" size={24} color="#ff0000" />
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            addToFavorites();
                        }}
                        style={({ pressed }) => [pressed && CommonStyles.buttonPressed, { padding: 8 }]}
                    >
                        <Entypo name="heart-outlined" size={24} color="#f1f1f1" />
                    </Pressable>
                )}
            </View>

            <View style={styles.tabContainer}>
                <Pressable 
                    style={[CommonStyles.componentContainer, styles.tab, activeTab === 1 && styles.activeTab]} 
                    onPress={() => {
                        setActiveTab(1);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>RSI</Text>
                </Pressable>
                <Pressable 
                    style={[CommonStyles.componentContainer, styles.tab, activeTab === 2 && styles.activeTab]} 
                    onPress={() => {
                        setActiveTab(2);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>Charts</Text>
                </Pressable>
                <Pressable 
                    style={[CommonStyles.componentContainer, styles.tab, activeTab === 3 && styles.activeTab]} 
                    onPress={() => {
                        setActiveTab(3);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>History</Text>
                </Pressable>
            </View>

            {activeTab === 1 ? (
                isRSILoading ? (
                    <View style={[styles.statsCard, { alignItems: "center", gap: 10 }]}>
                        <ActivityIndicator size="small" color="#20ca17" />
                    </View>
                ) : (
                <View style={[styles.statsCard, { alignItems: "center", gap: 10 }]}>
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            openHelp();
                        }}
                        style={({ pressed }) => [
                            styles.helpButton,
                            pressed && CommonStyles.buttonPressed
                        ]}
                    >
                        <Text style={{ margin: "auto", color: "#f1f1f1" }}>?</Text>
                    </Pressable>

                    <View style={{ position: "absolute", left: 8, top: 8 }}>
                        <Text style={{ margin: "auto", color: "#7b7b7b", marginBottom: 4 }}>{isFemaleIndex ? "Female" : "Male"}</Text>
                        <Switch
                            value={isFemaleIndex}
                            onValueChange={(value) => setIsFemaleIndex(value)}
                        />
                    </View>

                    <Modal
                        transparent
                        visible={isHelpVisible}
                        animationType="fade"
                        onRequestClose={closeHelp}
                    >
                        <Pressable style={[MenuStyles.menuOverlay, { paddingTop: 200, paddingRight: 70 }]} onPress={closeHelp}>
                            <Animated.View
                                style={[
                                    MenuStyles.menu,
                                    { padding: 16, width: 260 },
                                    {
                                        opacity: menuAnim,
                                        transform: [{ scale: menuAnim }],
                                    }
                                ]}
                            >
                                <View style={styles.helpRow}>
                                    <View style={styles.helpColorBox} />
                                    <Text style={CommonStyles.text}>Elite</Text>
                                    <Text style={CommonStyles.text}>(95-100)</Text>
                                </View>
                                <View style={styles.helpRow}>
                                    <View style={[styles.helpColorBox, { backgroundColor: "#1fc41f" }]} />
                                    <Text style={CommonStyles.text}>Advanced</Text>
                                    <Text style={CommonStyles.text}>(75-94)</Text>
                                </View>
                                <View style={styles.helpRow}>
                                    <View style={[styles.helpColorBox, { backgroundColor: "#9acd32" }]} />
                                    <Text style={CommonStyles.text}>Intermediate</Text>
                                    <Text style={CommonStyles.text}>(50-74)</Text>
                                </View>
                                <View style={styles.helpRow}>
                                    <View style={[styles.helpColorBox, { backgroundColor: "#ffd700" }]} />
                                    <Text style={CommonStyles.text}>Novice</Text>
                                    <Text style={CommonStyles.text}>(35-49)</Text>
                                </View>
                                <View style={styles.helpRow}>
                                    <View style={[styles.helpColorBox, { backgroundColor: "#ff8c00" }]} />
                                    <Text style={CommonStyles.text}>Beginner</Text>
                                    <Text style={CommonStyles.text}>(20-34)</Text>
                                </View>
                                <View style={styles.helpRow}>
                                    <View style={[styles.helpColorBox, { backgroundColor: "#dc143c" }]} />
                                    <Text style={CommonStyles.text}>Non lifter</Text>
                                    <Text style={CommonStyles.text}>(0-19)</Text>
                                </View>
                                <Text style={{ color: "#767676", textAlign: "center", marginTop: 16 }}>Flip the switch to see the RSI for women</Text>
                                <Text style={{ color: "#767676", textAlign: "center", marginTop: 16 }}>All exercise data regarding this RSI has been aquired from strengthlevel.com</Text>
                            </Animated.View>
                        </Pressable>
                    </Modal>

                    <Text style={styles.rsiTitle}>Strength Index</Text>
                    <View style={[styles.rsiCircle, { borderColor: getScoreColor(strengthScore) }]}>
                        <Text style={styles.rsiScore}>{strengthScore}</Text>
                    </View>
                    
                    {eliteBWRatio ? (
                            <View style={{ width: "100%" }}>
                                <View style={styles.rsiInfoContainer}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.rsiInfoText}>Est. 1RM</Text>
                                        <Text style={styles.rsiInfoStats}>{oneRepMax} kg</Text>
                                    </View>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.rsiInfoText}>Relative</Text>
                                        <Text style={styles.rsiInfoStats}>
                                            {userWeight > 0 ? (oneRepMax / userWeight).toFixed(2) : "-"}x
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.rsiInfoBottomText}>
                                    Score based on {elite}x bodyweight benchmark.
                                </Text>
                            </View>
                    ) : eliteReps ? (
                            <View style={{width: "100%"}}>
                                <View style={styles.rsiInfoContainer}>
                                    <View style={{ alignItems: "center" }}>
                                        <Text style={styles.rsiInfoText}>Max Reps</Text>
                                        <Text style={styles.rsiInfoStats}>{maxReps}</Text>
                                    </View>
                                </View>
                                <Text style={styles.rsiInfoBottomText}>
                                    Score based on {elite} reps benchmark.
                                </Text>
                            </View>
                    ) : null}
                </View>
                )
            ) : activeTab === 2 ? (
                <View>
                    {isHistoryLoading ? (
                        <ActivityIndicator size="small" color="#20ca17" />
                    ) : history.length === 0 ? (
                        <Text style={CommonStyles.empty}>No data yet</Text>
                    ) : (
                        <View style={styles.statsCard}>
                            <ExerciseChart history={history} />
                        </View>
                    )}
                </View>
            ) : activeTab === 3 ? (
                <View style={{ marginTop: 4 }}>
                    <FlatList
                        data={exerciseSessions}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.date}
                        style={CommonStyles.list}
                        renderItem={({ item }) => {
                            return (
                                <View style={[CommonStyles.componentContainer, styles.sessionContainer]}>
                                    <Text style={styles.dateText}>{formatDateWOZeros(item.date)}</Text>
                                    <View style={styles.setsContainer}>
                                        {item.sets?.map((set, index) => (
                                            <View key={index} style={styles.setItem}>
                                                <Text style={styles.setText}>{index + 1}. {set.reps} reps x {set.weight} kg</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                            Alert.alert(
                                                "Delete session?", "Are you sure you want to delete this session?", 
                                                [{ text: "No", style: "cancel" }, { text: "Yes", onPress: () => undefined }],
                                                { cancelable: true }
                                            )
                                        }}
                                        style={({ pressed }) => [
                                            styles.deleteButton,
                                            pressed && CommonStyles.buttonPressed, 
                                            { borderBottomWidth: 0 }
                                        ]}
                                    >
                                        <FontAwesome6 name="trash-can" size={24} color="red" />
                                    </Pressable>
                                </View>
                            );
                        }}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            isSessionsLoading ? (
                                <ActivityIndicator size="small" color="#20ca17" />
                            ) : (
                                <Text style={CommonStyles.empty}>No sessions yet</Text>
                            )
                        }
                    />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginVertical: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#393939",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: "#f1f1f1",
        fontSize: 24,
        fontWeight: "700",
    },
    subtitle: {
        color: "#7b7b7b",
        fontSize: 17,
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        padding: 16,
    },
    tab: { 
        width: "31%", 
        backgroundColor: "#262626", 
        padding: 10, 
        borderRadius: 999,
    },
    tabText: { 
        color: "#f1f1f1", 
        fontSize: 22, 
        textAlign: "center",
    },
    activeTab: {
        backgroundColor: "#20ca17",
    },
    activeTabText: {
        color: "#1e1e1e",
        fontWeight: "700",
    },
    statsCard: {
        backgroundColor: "#262626",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#393939",
        marginTop: 4
    },
    helpButton: {
        width: 40, 
        height: 40, 
        borderWidth: 1, 
        borderColor: "#393939", 
        borderRadius: 999, 
        position: "absolute", 
        right: 8, 
        top: 8,
    },
    helpRow: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 6
    },
    helpColorBox: {
        width: 30,
        height: 30,
        backgroundColor: "#1e90ff",
        borderRadius: 8,
        marginRight: 12,
    },
    rsiInfoContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        width: '100%', 
        marginTop: 20, 
    },
    rsiTitle: { 
        color: "#7b7b7b", 
        fontSize: 16, 
    },
    rsiCircle: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        borderWidth: 8,
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    rsiScore: { 
        color: "#f1f1f1", 
        fontSize: 42,
        fontWeight: "800",
    },
    rsiInfoText: { 
        color: "#7b7b7b", 
        fontSize: 14 
    },
    rsiInfoStats: { 
        color: "#f1f1f1", 
        fontSize: 22, 
        fontWeight: "700", 
    },
    rsiInfoBottomText: { 
        color: "#555", 
        fontSize: 12, 
        textAlign: 'center', 
        marginTop: 10, 
    },
	listContent: {
		paddingBottom: 24,
	},
    sessionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#262626",
        padding: 8,
		marginVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#393939",
        marginHorizontal: 6,
    },
    dateText: {
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        marginVertical: "auto",
        marginLeft: 16,
        color: "#f1f1f1",
    },
    setsContainer: {
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        gap: 8,
    },
    setItem: {
        marginBottom: 0,
    },
    setText: {
        color: "#f1f1f1",
        fontSize: 18,
    },
    deleteButton: {
        marginVertical: "auto",
        marginRight: 16,
    },
});
