import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import ExerciseChart from "../components/Stats/ExerciseChart";
import { CommonStyles } from "../styles/CommonStyles";
import { getExerciseHistory, getExerciseLastSession } from "../services/exercises";
import { StatsStackParamList } from "../navigation/StatsStack";
import { useAuthContext } from "../auth/UseAuthContext";
import { getWeightHistory } from "../services/weights";
import { calculateOneRepMax, calculateStrengthScoreBWRatio, calculateStrengthScoreReps, formatLocalDateISO } from "../utils/Utils";


export default function ExerciseStatsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();
    const route = useRoute<RouteProp<StatsStackParamList, "ExerciseStats">>();
    const { exerciseId, name, muscleGroup, eliteBWRatio, eliteReps } = route.params;
    const { session } = useAuthContext();

    const [history, setHistory] = useState<{ date: string; avgReps: number; avgWeight: number }[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
    const [isRSILoading, setIsRSILoading] = useState<boolean>(true);

    const [strengthScore, setStrengthScore] = useState<number>(0);
    const [oneRepMax, setOneRepMax] = useState<number>(0);
    const [maxReps, setMaxReps] = useState<number>(0);
    const [userWeight, setUserWeight] = useState<number>(0);
    const [elite, setElite] = useState<number>(0);

    const [activeTab, setActiveTab] = useState<number>(1);

    const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return { startDate: null, endDate: null}; 
		}

        try {
            setIsHistoryLoading(true);
            
            const historyData = await getExerciseHistory(exerciseId);
            setHistory(historyData || []);

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
                    ({ score, scaledElite } = calculateStrengthScoreBWRatio(max1RM, currentWeight, eliteBWRatio));
                }

                else if (eliteReps) {
                    lastSessionSets.forEach((set: any) => {
                        if (set.reps > maxR) { maxR = set.reps };
                    });
                    setMaxReps(maxR);
                    ({ score, scaledElite } = calculateStrengthScoreReps(maxR, currentWeight, eliteReps));
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
            setIsRSILoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [exerciseId]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#20ca17";
        if (score >= 50) return "#f1c40f";
        if (score >= 20) return "#ff5c00";
        return "#e74c3c";
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
            </View>

            <View style={styles.tabContainer}>
                <Pressable style={[styles.tab, activeTab === 1 && styles.activeTab]} onPress={() => setActiveTab(1)}>
                    <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Overview</Text>
                </Pressable>
                <Pressable style={[styles.tab, activeTab === 2 && styles.activeTab]} onPress={() => setActiveTab(2)}>
                    <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>Charts</Text>
                </Pressable>
                <Pressable style={[styles.tab, activeTab === 3 && styles.activeTab]} onPress={() => setActiveTab(3)}>
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
                <View style={styles.statsCard}>
                    <Text style={{ color: "#f1f1f1", fontSize: 20, marginTop: 0 }}>Tähän sessiohistoria</Text>
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
        marginBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#2b2b2b",
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
        padding: 8,
    },
    tab: { 
        width: "31%", 
        backgroundColor: "#2b2b2b", 
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
        backgroundColor: "#2b2b2b",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#393939",
        marginTop: 8,
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
});
