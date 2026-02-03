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
    Dimensions,
    Alert,
    ScrollView
} from "react-native";
import * as Haptics from 'expo-haptics';
import { useEffect, useState, useCallback } from "react";
import { formatDate, formatLocalDateISO, capitalize, dayDiff } from "../../utils/Utils";
import { Bar } from "react-native-progress";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useFocusEffect } from "@react-navigation/native";
import { CommonStyles } from "../../styles/CommonStyles";
import { useAuthContext } from "../../auth/UseAuthContext";
import { WeightEntry, getCurrentWeight } from "../../services/weights";
import PhaseChart from "./PhaseChart";
import { updatePhase } from "../../services/phase";
import { useToast } from "../ToastConfig";
import UpdatePhaseModal from "../../modal/Phase/UpdatePhaseModal";


type Props = {
    error: string | null;
    phaseId: number;
    startDate: Date;
    endDate: Date | null;
    type: string;
    history: WeightEntry[];
    startingWeight: number;
    weightGoal: number | null;
    setError: (error: string | null) => void;
    onWeightUpdate: () => void;
    onPhaseUpdate: () => void;
};

export default function ActivePhase({
    error,
    phaseId,
    startDate,
    endDate,
    type,
    history,
    startingWeight,
    weightGoal,
    setError,
    onWeightUpdate,
    onPhaseUpdate
}: Props) {
    const [phaseProgress, setPhaseProgress] = useState<number>(0);
    const [phaseWeightProgress, setPhaseWeightProgress] = useState<number>(0);
    const [currentWeight, setCurrentWeight] = useState<number | null>(null);

    const { session } = useAuthContext();

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const screenWidth = Dimensions.get("window").width;

    const loadData = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return null; 
		}
        if (formatLocalDateISO(startDate).localeCompare(formatLocalDateISO(new Date())) >= 0) {
            setCurrentWeight(null);
            setPhaseWeightProgress(0);
            return null;
        }

        try {
            const weightData = await getCurrentWeight(session.user.id);
            setCurrentWeight(weightData[0].weight || null);
            return weightData[0].weight || null;
        
        } catch (error) {
            Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
            return null;
        }
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

    const updateCurrentPhase = async (
        updatedType: string | null = null,
        updatedStartDate: Date | null = null, 
        updatedEndDate: Date | null = null, 
        updatedStartingWeight: number | null = null, 
        updatedWeightGoal: number | null = null
    ) => {

        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}
		
		try {
            const newStartDate = formatLocalDateISO(updatedStartDate ?? startDate);
            let newEndDate: string | null;
            if (updatedEndDate !== null && updatedEndDate !== undefined) {
                newEndDate = formatLocalDateISO(updatedEndDate);
            } else if (endDate) {
                newEndDate = formatLocalDateISO(endDate);
            } else {
                newEndDate = null;
            }

            if (newEndDate) {
                if (newStartDate.localeCompare(newEndDate) >= 0) {
                    setError("Start date can't be after end date");
                    return;
                }
            }

            const newType = updatedType ?? type;
            const newStartingWeight = updatedStartingWeight !== 0 && updatedStartingWeight ? updatedStartingWeight : startingWeight;
            const newWeightGoal = updatedWeightGoal !== 0 && updatedWeightGoal ? updatedWeightGoal : weightGoal;

			await updatePhase(session.user.id, phaseId, newType, newStartDate, newEndDate, newStartingWeight, newWeightGoal);

            closeModal();
            onPhaseUpdate();
            useToast("success", "Phase updated", "Your phase details were updated successfully");

		} catch (error) {
			Alert.alert("Failed to update phase", "Please try again");
			console.error(`Failed to update phase: ${error}`);
		}
	};

    const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setIsModalVisible(true);
		setError(null);
	};

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ margin: 0, padding: 0 }}>
                <View style={styles.phaseManagementContainer}>
                    <Pressable>
                        <FontAwesome6 name="trash-can" size={24} color="red" />
                    </Pressable>
                    <Text style={styles.phaseText}>{capitalize(type)}</Text>
                    <Pressable 
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            openModal();
                        }}
                    >
                        <FontAwesome6 name="pencil" size={24} color="#f1f1f1" />
                    </Pressable>
                </View>

                <ScrollView>
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
                                style={{ marginVertical: 8 }}
                            />
                        </View>
                    ) : null}

                    <View style={styles.phaseInfoContainer}>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#20ca17" }]}>Start date:</Text>
                            <Text style={styles.dateText}>{formatDate(formatLocalDateISO(startDate))}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#20ca17" }]}>End date:</Text>
                            <Text style={styles.dateText}>{endDate ? formatDate(formatLocalDateISO(endDate)) : "?"}</Text>
                        </View>
                    </View>

                    {weightGoal ? (
                        <View>
                            <Text style={styles.centeredText}>{currentWeight || "?"}kg</Text>
                            <Bar 
                                progress={phaseWeightProgress}
                                animated
                                color="#4a9eff"
                                width={screenWidth - 32}
                                height={8}
                                animationConfig={{ bounciness: 1 }}
                                style={{ marginVertical: 8 }}
                            />
                        </View>
                    ) : null}

                    <View style={styles.phaseInfoContainer}>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Starting weight:</Text>
                            <Text style={styles.weightText}>{startingWeight.toString()}kg</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Weight goal:</Text>
                            <Text style={styles.weightText}>{weightGoal ? weightGoal.toString() : "?"}kg</Text>
                        </View>
                    </View>

                    <PhaseChart 
                        history={history}
                        startingWeight={startingWeight}
                        weightGoal={weightGoal}
                    />
                </ScrollView>

                {error ? <Text style={CommonStyles.error}>{error}</Text> : null}

                {isModalVisible ? (
                    <UpdatePhaseModal 
                        visible={isModalVisible}
                        error={error}
                        oldStartDate={startDate}
                        oldEndDate={endDate}
                        oldType={type}
                        onClose={closeModal}
                        onConfirm={updateCurrentPhase}
                    />
                ) : null}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    phaseManagementContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        marginTop: 0,
    },
    phaseText: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "500",
        color: "#f1f1f1",
    },
    phaseInfoContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 12,
    },
    infoBox: {
        width: "35%",
    },
    dateText: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "500",
        marginVertical: 4,
        color: "#f1f1f1",
    },
    weightText: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "500",
        marginVertical: 4,
        color: "#f1f1f1",
    },
    centeredText: {
        textAlign: "center",
        fontSize: 12,
        marginVertical: 2,
        color: "#f1f1f1",
    },
});
