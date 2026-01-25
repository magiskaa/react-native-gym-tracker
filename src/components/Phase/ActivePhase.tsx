import { 
    FlatList, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from "react-native";
import * as Haptics from 'expo-haptics';
import { updatePhase, getCurrentWeight } from "../../services/database";
import { useEffect, useState, useCallback } from "react";
import { formatDate, formatLocalDateISO, capitalize, dayDiff } from "../../utils/Utils";
import { Bar } from "react-native-progress";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect } from "@react-navigation/native";

type Props = {
    error: string | null;
    user: number;
    startDate: Date;
    endDate: Date | null;
    phase: string;
    startingWeight: number;
    weightGoal: number | null;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date | null) => void;
    setPhase: (phase: string) => void;
    setStartingWeight: (weight: number) => void;
    setWeightGoal: (goal: number | null) => void;
    onWeightUpdate: () => void;
};

export default function ActivePhase({
    error,
    user,
    startDate,
    endDate,
    phase,
    startingWeight,
    weightGoal,
    setStartDate,
    setEndDate, 
    setPhase,
    setStartingWeight,
    setWeightGoal,
    onWeightUpdate
}: Props) {
    const [phaseProgress, setPhaseProgress] = useState<number>(0);
    const [phaseWeightProgress, setPhaseWeightProgress] = useState<number>(0);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);

    const screenWidth = Dimensions.get("window").width;

    const loadData = async () => {
        try {
            const weight = await getCurrentWeight();
            setCurrentWeight(weight[0].weight || null);
            return weight[0].weight || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const updateCurrentPhase = async () => {
		//const startDate = startDate.toISOString().slice(0, 10);
		//const endDate = endDate.toISOString().slice(0, 10);
        //await updatePhase(user, phase, startDate, endDate, startingWeight, weightGoal);
    };

    const calculatePhaseProgress = (currentWeight: number | null) => {
        if (endDate) { 
            const daysInPhase = dayDiff(startDate, endDate);
            const daysToGo = dayDiff(new Date(), endDate);
            setPhaseProgress(Number(((daysInPhase - daysToGo) / daysInPhase).toFixed(2)));
        }

        if (weightGoal && currentWeight) {
            setPhaseWeightProgress(Number(((currentWeight - startingWeight) / (weightGoal - startingWeight)).toFixed(2)));
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData().then((w) => calculatePhaseProgress(w));
            onWeightUpdate();
        }, [startDate, endDate, weightGoal, startingWeight, onWeightUpdate])
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.phaseManagementContainer}>
                    <Pressable>
                        <FontAwesome6 name="trash-can" size={24} color="red" />
                    </Pressable>
                    <Pressable>
                        <FontAwesome6 name="pencil" size={24} color="black" />
                    </Pressable>
                </View>

                {endDate ? (
                    <View>
                        <Text style={styles.centeredText}>{formatDate(formatLocalDateISO(new Date()))}</Text>
                        <Bar 
                            progress={phaseProgress}
                            animated
                            color="#20ca17"
                            width={screenWidth - 32}
                            height={8}
                            animationConfig={{ bounciness: 1 }}
                            style={{ marginBottom: 16 }}
                        />
                    </View>
                ) : null}
                {weightGoal ? (
                    <View>
                        <Text style={styles.centeredText}>{currentWeight}kg</Text>
                        <Bar 
                            progress={phaseWeightProgress}
                            animated
                            color="#4a9eff"
                            width={screenWidth - 32}
                            height={8}
                            animationConfig={{ bounciness: 1 }}
                            style={{ marginBottom: 16 }}
                        />
                    </View>
                ) : null}
                
                <View style={styles.phaseInfoContainer}>
                    <Text style={styles.phaseText}>{capitalize(phase)}</Text>
                    <View style={styles.dateContainer}>
                        <View>
                            <Text style={[styles.centeredText, { color: "#20ca17" }]}>Start date:</Text>
                            <Text style={styles.dateText}>{formatDate(formatLocalDateISO(startDate))}</Text>
                        </View>
                        <View>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Starting weight:</Text>
                            <Text style={styles.weightText}>{startingWeight.toString()}kg</Text>
                        </View>
                        <View>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Weight goal:</Text>
                            <Text style={styles.weightText}>{weightGoal ? weightGoal.toString() : "?"}kg</Text>
                        </View>
                        <View>
                            <Text style={[styles.centeredText, { color: "#20ca17" }]}>End date:</Text>
                            <Text style={styles.dateText}>{endDate ? formatDate(formatLocalDateISO(endDate)) : "?"}</Text>
                        </View>
                    </View>
                </View>

                
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
    },
    error: {
        color: "#b00020",
        marginBottom: 12,
        textAlign: "center"
    },
    phaseManagementContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
        marginTop: -6,
    },
    phaseInfoContainer: {
        backgroundColor: "#e3e3e3",
        borderRadius: 12,
        padding: 6,
    },
    phaseText: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "500",
        marginBottom: 16,
    },
    dateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    dateText: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "500",
        marginVertical: 4,
    },
    weightText: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "500",
        marginVertical: 4,
    },
    centeredText: {
        textAlign: "center",
        fontSize: 12,
        marginVertical: 2,
    },
});
