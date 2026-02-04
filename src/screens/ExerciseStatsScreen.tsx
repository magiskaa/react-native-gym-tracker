import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import ExerciseChart from "../components/Stats/ExerciseChart";
import { CommonStyles } from "../styles/CommonStyles";
import { getExerciseHistory } from "../services/exercises";
import { StatsStackParamList } from "../navigation/StatsStack";


export default function ExerciseStatsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();
    const route = useRoute<RouteProp<StatsStackParamList, "ExerciseStats">>();
    const { exerciseId, name, muscleGroup } = route.params;

    const [history, setHistory] = useState<{ date: string; avgReps: number; avgWeight: number }[]>([]);

    const [activeTab, setActiveTab] = useState<number>(1);

    const loadHistory = async () => {
        try {
            const data = await getExerciseHistory(exerciseId);
            setHistory(data);

        } catch (error) {
            Alert.alert("Failed to load data", "Please try again later");
            console.error(`Failed to load data: ${error}`);
            setHistory([]);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [exerciseId]);

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
                <View style={styles.statsCard}>
                    <Text style={{ color: "#f1f1f1", fontSize: 20, marginTop: 0 }}>Tähän vahvuusindeksi</Text>
                </View>
            ) : activeTab === 2 ? (
                <View>
                    {history.length === 0 ? (
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
});
