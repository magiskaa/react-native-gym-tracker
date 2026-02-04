import { StyleSheet, Text, View, Pressable, FlatList, Dimensions, Alert, Modal } from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import LogCaloriesModal from "../modal/Nutrition/LogCaloriesModal";
import SetNutritionGoalsModal from "../modal/Nutrition/SetNutritionGoalsModal";
import { formatDateWOZeros, formatLocalDateISO } from "../utils/Utils";
import NutritionChart from "../components/Nutrition/NutritionChart";
import { CommonStyles } from "../styles/CommonStyles";
import { MenuStyles } from "../styles/MenuStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { Nutrition, getNutrition, getNutritionByDate, addNutrition, updateNutrition } from "../services/nutrition";
import { getNutritionGoals, updateNutritionGoals, addNutritionGoals } from "../services/nutritionGoals";
import { useToast } from "../components/ToastConfig";
import Entypo from '@expo/vector-icons/Entypo';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NutritionStackParamList } from "../navigation/NutritionStack";


export default function NutritionScreen() {
    const [nutrition, setNutrition] = useState<Nutrition[]>([]);
    const { session } = useAuthContext();
    const navigation = useNavigation<NativeStackNavigationProp<NutritionStackParamList>>();

    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
    const [proteinGoal, setProteinGoal] = useState<number | null>(null);

    const [calories, setCalories] = useState<number>(0);
    const [protein, setProtein] = useState<number>(0);
    const [date, setDate] = useState<Date>(new Date());
    const today = formatLocalDateISO(new Date());

    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState<boolean>(false);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    const [isRemoveActive, setIsRemoveActive] = useState<boolean>(false);

    const loadData = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        try {
            let nutritionData = await getNutrition(session.user.id);
            let nutritionGoalsData = await getNutritionGoals(session.user.id);

            if (nutritionData.length > 0) {
                if (nutritionData[0].date !== today) {
                    nutritionData = await addNutrition(session.user.id, today);
                }
            }
            if (nutritionData.length === 0) {
                nutritionData = await addNutrition(session.user.id, today);
                if (nutritionGoalsData.length === 0) {
                    await addNutritionGoals(session.user.id);
                    nutritionGoalsData = await getNutritionGoals(session.user.id);
                }
            }

            setCalorieGoal(nutritionGoalsData[0].calorieGoal || null);
            setProteinGoal(nutritionGoalsData[0].proteinGoal || null);

            setNutrition(nutritionData);
            setCalories(nutritionData[0].calories || 0);
            setProtein(nutritionData[0].protein || 0);

        } catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
        }
    };

    useEffect(() => {
        loadData();
    }, [calories, protein]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [session?.user.id])
    );

    const logCalories = async (cal: number, prot: number) => { 
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        const formattedDate = formatLocalDateISO(date);
        const today = formatLocalDateISO(new Date());

        if (formattedDate.localeCompare(today) > 0) {
            setError("Please select a date that is not in the future");
            return;
        }

        if (cal === 0 && prot === 0) {
            setError("Please enter calories and/or protein");
            return;
        }

        try {
            const nutritionData = await getNutritionByDate(session.user.id, formattedDate);

            if (nutritionData.length === 0) {
                await addNutrition(session.user.id, formattedDate, cal, prot);
            } else {
                const existingCal = nutritionData[0].calories || 0;
                const existingProt = nutritionData[0].protein || 0;

                if (isRemoveActive) {
                    await updateNutrition(session.user.id, formattedDate, (existingCal - cal) < 0 ? 0 : (existingCal - cal), (existingProt - prot) < 0 ? 0 : (existingProt - prot));

                    if (formatLocalDateISO(date) === today) {
                        setCalories(calories - cal);
                        setProtein(protein - prot);
                    }
                } else {
                    await updateNutrition(session.user.id, formattedDate, existingCal + cal, existingProt + prot);

                    if (formatLocalDateISO(date) === today) {
                        setCalories(calories + cal);
                        setProtein(protein + prot);
                    }
                }
            }

            closeModal();
            loadData();
            useToast("success", "Nutrition updated", "Your nutrition entry was added successfully");

        } catch (error) {
            Alert.alert("Failed to log calories", "Please try again");
            console.error(`Failed to log calories: ${error}`);
        }
    };

    const updateGoals = async (calGoal: number, protGoal: number) => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        if (calGoal === 0 && protGoal === 0) {
            setError("Please fill nutrition goals");
            return;
        }

        try {
            if (!calorieGoal && !proteinGoal) {
                if (calGoal === 0 || protGoal === 0) {
                    setError("Please set both goals");
                    return;
                }
                await updateNutritionGoals(session.user.id, calGoal, protGoal);
            }

            if (calorieGoal && proteinGoal) {
                await updateNutritionGoals(session.user.id, calGoal === 0 ? calorieGoal : calGoal, protGoal === 0 ? proteinGoal : protGoal);
            }

            closeGoalModal();
            loadData();
            useToast("success", "Nutrition goals updated", "Your nutrition goals were saved successfully");

        } catch (error) {
            Alert.alert("Failed to set goals", "Please try again");
            console.error(`Failed to set goals: ${error}`);
        }
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setError(null);
        setIsRemoveActive(false);
        setDate(new Date());
    };

    const openModal = () => {
        setIsModalVisible(true);
        setError(null);
        setIsRemoveActive(false);
    };

    const closeGoalModal = () => {
        setIsGoalModalVisible(false);
        setError(null);
    };

    const openGoalModal = () => {
        setIsGoalModalVisible(true);
        setError(null);
    };

    const openMenu = () => {
		setIsMenuVisible(true);
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

    return (
        <View style={CommonStyles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Today's Nutrition</Text>
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

            <View style={styles.nutritionContainer}>
                <View style={styles.progressContainer}>
                    <View>
                        <Text style={styles.progressTitle}>Calories / {calorieGoal}</Text>
                        <Circle
                            progress={(Number(calories || 0) / (calorieGoal || 1)) > 1 ? 1 : (Number(calories || 0) / (calorieGoal || 1))}
                            size={110}
                            thickness={10}
                            borderWidth={0}
                            color="#20ca17"
                            animated
                            showsText
                            formatText={() => `${calories}`}
                            textStyle={{ fontSize: 32 }}
                            style={styles.progress}
                        />
                    </View>
                    <View>
                        <Text style={styles.progressTitle}>Protein / {proteinGoal}</Text>
                        <Circle
                            progress={(Number(protein || 0) / (proteinGoal || 1)) > 1 ? 1 : (Number(protein || 0) / (proteinGoal || 1))}
                            size={110}
                            thickness={10}
                            borderWidth={0}
                            color="#4a9eff"
                            animated
                            showsText
                            formatText={() => `${protein}`}
                            textStyle={{ fontSize: 32 }}
                            style={styles.progress}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable 
                        onPress={() => {
                            navigation.navigate("NutritionHistory", {
                                nutrition
                            });
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                        }}
                        style={({ pressed }) => [
                            CommonStyles.button,
                            pressed && CommonStyles.buttonPressed,
                            styles.actionButton
                        ]}
                    >
                        <Entypo name="list" size={20} color="black" style={{ textAlign: "center", margin: "auto" }} />
                    </Pressable>

                    <Pressable 
                        onPress={() => {
                            openModal(); 
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                        }}
                        style={({ pressed }) => [
                            CommonStyles.button,
                            pressed && CommonStyles.buttonPressed,
                            styles.actionButton
                        ]}
                    >
                        <Entypo name="plus" size={20} color="black" style={{ textAlign: "center", margin: "auto" }} />
                    </Pressable>
                </View>
            </View>

            <Text style={styles.title}>Calorie Chart</Text>
            <NutritionChart 
                history={nutrition}
            />

            {isModalVisible ? (
                <LogCaloriesModal 
                    visible={isModalVisible}
                    error={error}
                    dateInput={new Date(date)}
                    isRemoveActive={isRemoveActive}
                    setDateInput={setDate}
                    setIsRemoveActive={setIsRemoveActive}
                    onClose={closeModal}
                    onConfirm={logCalories}
                />
            ) : null}

            {isGoalModalVisible ? (
                <SetNutritionGoalsModal 
                    visible={isGoalModalVisible}
                    error={error}
                    onClose={closeGoalModal}
                    onConfirm={updateGoals}
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
                                openGoalModal();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                            style={({ pressed }) => [
                                MenuStyles.menuItem,
                                pressed && CommonStyles.buttonPressed
                            ]}
                        >
                            <Text style={MenuStyles.menuText}>Set nutrition goals</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                closeMenu();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                            style={({ pressed }) => [
                                MenuStyles.menuItem,
                                pressed && CommonStyles.buttonPressed, 
                                { borderBottomWidth: 0 }
                            ]}
                        >
                            <Text style={MenuStyles.menuText}>Reset today's nutrition</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	title: {
        fontSize: 22,
        marginTop: 8,
        marginBottom: 8,
        marginHorizontal: 4,
        fontWeight: "700",
        color: "#f1f1f1",
        letterSpacing: 0.3,
    },
    nutritionContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#393939",
        padding: 16,
        marginVertical: 6,
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginBottom: 8,
        gap: 12,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
        marginBottom: 8,
        color: "#f1f1f1",
    },
    progress: {
        marginHorizontal: 6,
    },
    buttonContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
    },
    actionButton: {
        width: 55,
        height: 55,
    },
});
