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
import { updatePhase, getCurrentWeight } from "../services/database";
import { useEffect, useState } from "react";
import { formatDate, capitalize, dayDiff } from "../utils/Utils";
import { Bar } from "react-native-progress";

type Props = {
    error: string | null;
    user: number;
    startDateInput: Date;
    endDateInput: Date | null;
    phaseInput: string;
    startingWeight: number;
    weightGoalInput: number | null;
    setStartDateInput: (date: Date) => void;
    setEndDateInput: (date: Date | null) => void;
    setPhaseInput: (phase: string) => void;
    setStartingWeight: (weight: number) => void;
    setWeightGoalInput: (goal: number | null) => void;
};

export default function ActivePhase({
    error,
    user,
    startDateInput,
    endDateInput,
    phaseInput,
    startingWeight,
    weightGoalInput,
    setStartDateInput,
    setEndDateInput, 
    setPhaseInput,
    setStartingWeight,
    setWeightGoalInput,
}: Props) {
    const [phaseProgress, setPhaseProgress] = useState<number>(0);
    const [phaseWeightProgress, setPhaseWeightProgress] = useState<number>(0);

    const screenWidth = Dimensions.get("window").width;

    const loadData = async () => {
        try {
            const weight = await getCurrentWeight();
            return weight[0].weight || null;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    const updateCurrentPhase = async () => {
		//const startDate = startDateInput.toISOString().slice(0, 10);
		//const endDate = endDateInput.toISOString().slice(0, 10);


        //await updatePhase(user, phaseInput, startDate, endDate, weightGoalInput);
    };

    const calculatePhaseProgress = (currentWeight: number | null) => {
        if (endDateInput) { 
            const daysInPhase = dayDiff(startDateInput, endDateInput);
            const daysToGo = dayDiff(new Date(), endDateInput);
            setPhaseProgress(Number((daysToGo / daysInPhase).toFixed(2)));
        }

        if (weightGoalInput && currentWeight) {
            setPhaseWeightProgress(Number(((currentWeight - startingWeight) / (weightGoalInput - startingWeight)).toFixed(2)));
        }
    };

    useEffect(() => {
        loadData().then((w) => calculatePhaseProgress(w));
    }, [startDateInput, endDateInput, weightGoalInput, startingWeight]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {endDateInput ? (
                    <View>
                        <Text style={styles.centeredText}>{phaseProgress * 100}%</Text>
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
                {weightGoalInput ? (
                    <View>
                        <Text style={styles.centeredText}>{phaseWeightProgress * 100}%</Text>
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
                    <Text style={styles.phaseText}>{capitalize(phaseInput)}</Text>
                    <View style={styles.dateContainer}>
                        <View>
                            <Text style={styles.centeredText}>Start date:</Text>
                            <Text style={styles.dateText}>{formatDate(startDateInput.toISOString().slice(0, 10))}</Text>
                        </View>
                        <View>
                            <Text style={styles.centeredText}>Starting weight:</Text>
                            <Text style={styles.weightText}>{startingWeight.toString()}kg</Text>
                        </View>
                        <View>
                            <Text style={styles.centeredText}>Weight goal:</Text>
                            <Text style={styles.weightText}>{weightGoalInput ? weightGoalInput.toString() : "?"}kg</Text>
                        </View>
                        <View>
                            <Text style={styles.centeredText}>End date:</Text>
                            <Text style={styles.dateText}>{endDateInput ? formatDate(endDateInput.toISOString().slice(0, 10)) : "?"}</Text>
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
    phaseInfoContainer: {
        width: "100%",
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
    },
});
