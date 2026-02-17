import { 
    ActivityIndicator,
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    Alert,
    ScrollView,
    Modal
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
import { updatePhase, deletePhase } from "../../services/phases";
import { useToast } from "../ToastConfig";
import UpdatePhaseModal from "../../modal/Phase/UpdatePhaseModal";
import { Entypo } from "@expo/vector-icons";
import { MenuStyles } from "../../styles/MenuStyles";
import { BlurView } from "expo-blur";


type Props = {
    error: string | null;
    phaseId: number;
    startDate: Date;
    endDate: Date | null;
    type: string;
    history: WeightEntry[];
    isHistoryLoading?: boolean;
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
    isHistoryLoading = false,
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
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

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

    const deleteCurrentPhase = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        try {
			await deletePhase(session.user.id, phaseId);

            onPhaseUpdate();
            useToast("success", "Phase deleted", "Current phase was deleted successfully");

		} catch (error) {
			Alert.alert("Failed to delete phase", "Please try again");
			console.error(`Failed to delete phase: ${error}`);
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

    const openMenu = () => {
		setIsMenuVisible(true);
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

    return (
        <View>
            <BlurView
                tint="dark"
                intensity={60}
                style={{ position: 'absolute', top: -64, left: -16, right: -16, zIndex: 1, paddingTop: 64, paddingHorizontal: 16 }}
            >
                <View style={CommonStyles.header}>
                    <Text style={CommonStyles.headerTitle}>Current Phase</Text>
                    <Pressable
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            openMenu();
                        }}
                        style={({ pressed }) => [
                            pressed && CommonStyles.buttonPressed
                        ]}
                    >
                        <Entypo name="dots-three-vertical" size={24} color="#f1f1f1" />
                    </Pressable>
                </View>
            </BlurView>

            <ScrollView 
                style={{ paddingTop: 56 }}
                contentContainerStyle={CommonStyles.scrollViewContentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={[CommonStyles.componentContainer, CommonStyles.section, { marginTop: 24 }]}>
                    <Text style={styles.phaseType}>{capitalize(type)}</Text>

                    {endDate ? (
                        <View>
                            <Text style={styles.centeredText}>{formatDate(formatLocalDateISO(new Date()))}</Text>
                            <Bar 
                                progress={phaseProgress}
                                animated
                                color="#20ca17"
                                width={screenWidth - 64}
                                height={8}
                                animationConfig={{ bounciness: 1 }}
                                style={{ marginVertical: 8 }}
                            />
                        </View>
                    ) : null}

                    <View style={styles.phaseInfo}>
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
                                width={screenWidth - 64}
                                height={8}
                                animationConfig={{ bounciness: 1 }}
                                style={{ marginVertical: 8 }}
                            />
                        </View>
                    ) : null}

                    <View style={styles.phaseInfo}>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Starting weight:</Text>
                            <Text style={styles.weightText}>{startingWeight.toString()}kg</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={[styles.centeredText, { color: "#4a9eff" }]}>Weight goal:</Text>
                            <Text style={styles.weightText}>{weightGoal ? weightGoal.toString() : "?"}kg</Text>
                        </View>
                    </View>
                </View>

                <View style={CommonStyles.section}>
                    <Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Charts</Text>
                    <View style={CommonStyles.componentContainer}>
                        {isHistoryLoading ? (
                            <View style={{ paddingVertical: 24 }}>
                                <ActivityIndicator size="small" color="#20ca17" />
                            </View>
                        ) : (
                            <PhaseChart 
                                history={history}
                                startingWeight={startingWeight}
                                weightGoal={weightGoal}
                            />
                        )}
                    </View>
                </View>
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

            <Modal
                transparent
                visible={isMenuVisible}
                animationType="fade"
                onRequestClose={closeMenu}
            >
                <Pressable style={MenuStyles.menuOverlay} onPress={closeMenu}>
                    <View style={MenuStyles.menu}>
                        <Pressable
                            onPress={() => {
                                closeMenu();
                                openModal();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                            style={({ pressed }) => [
                                MenuStyles.menuItem,
                                pressed && CommonStyles.buttonPressed
                            ]}
                        >
                            <Text style={MenuStyles.menuText}>Edit phase</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                closeMenu();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                Alert.alert(
                                    "Delete phase?", "Are you sure you want to delete this phase?", 
                                    [{ text: "No", style: "cancel" }, { text: "Yes", onPress: deleteCurrentPhase }], 
                                    { cancelable: true }
                                );
                            }}
                            style={({ pressed }) => [
                                MenuStyles.menuItem,
                                pressed && CommonStyles.buttonPressed, 
                                { borderBottomWidth: 0 }
                            ]}
                        >
                            <Text style={MenuStyles.menuText}>Delete phase</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    phaseInfoContainer: {
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#393939",
        padding: 16,
        marginVertical: 6,
    },
    phaseType: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "500",
        color: "#f1f1f1",
        marginBottom: 12,
    },
    phaseInfo: {
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
