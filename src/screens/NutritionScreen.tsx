import { StyleSheet, Text, View, Pressable, Alert, Modal, ScrollView, ActivityIndicator, Animated } from "react-native";
import { useCallback, useEffect, useState, useRef } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import LogCaloriesModal from "../modal/Nutrition/LogCaloriesModal";
import SetNutritionGoalsModal from "../modal/Nutrition/SetNutritionGoalsModal";
import { formatDateWOZeros, formatLocalDateISO } from "../utils/Utils";
import NutritionChart from "../components/Nutrition/NutritionChart";
import { CommonStyles } from "../styles/CommonStyles";
import { MenuStyles } from "../styles/MenuStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { Nutrition, getNutrition, getNutritionByDate, addNutrition, updateNutrition, deleteNutritionByDate } from "../services/nutrition";
import { getNutritionGoals, updateNutritionGoals, addNutritionGoals } from "../services/nutritionGoals";
import { useToast } from "../components/ToastConfig";
import Entypo from '@expo/vector-icons/Entypo';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NutritionStackParamList } from "../navigation/NutritionStack";


export default function NutritionScreen() {
    const [nutrition, setNutrition] = useState<Nutrition[]>([]);
	const [isNutritionLoading, setIsNutritionLoading] = useState<boolean>(true);

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
    const menuAnim = useRef(new Animated.Value(0)).current;

    const [isRemoveActive, setIsRemoveActive] = useState<boolean>(false);

    const loadData = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
            setIsNutritionLoading(false);
			return; 
		}

        try {
            setIsNutritionLoading(true);

            const todayEntry = await getNutritionByDate(session.user.id, today);
            if (todayEntry.length === 0) {
                await addNutrition(session.user.id, today);
            }

            const nutritionData = await getNutrition(session.user.id);
            nutritionData.forEach(row => {
                if ((row.calories === 0 || !row.calories) && (row.protein === 0 || !row.protein) && row.date !== today) {
                    deleteNutritionByDate(session.user.id, row.date);
                }
            });
            const filteredNutritionData = await getNutrition(session.user.id);

            setNutrition(filteredNutritionData);
            setCalories(filteredNutritionData[0]?.calories || 0);
            setProtein(filteredNutritionData[0]?.protein || 0);

            let nutritionGoalsData = await getNutritionGoals(session.user.id);
            if (nutritionGoalsData.length === 0) {
                await addNutritionGoals(session.user.id);
                nutritionGoalsData = await getNutritionGoals(session.user.id);
            }
            setCalorieGoal(nutritionGoalsData[0].calorieGoal || null);
            setProteinGoal(nutritionGoalsData[0].proteinGoal || null);

        } catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
        } finally {
            setIsNutritionLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [session?.user.id]);

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

    const resetNutrition = async () => {
        if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

        try {
            await updateNutrition(session.user.id, today, 0, 0);

            loadData();
            useToast("success", "Nutrition reset", "Today's nutrition was reset successfully");

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

    return (
        <View style={CommonStyles.container}>
            <View style={CommonStyles.header}>
                <Text style={CommonStyles.title}>Today's Nutrition</Text>
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

            <View style={[CommonStyles.componentContainer, styles.nutritionContainer]}>
                <View style={styles.progressContainer}>
                    <View style={{backgroundColor: "#20ca1720", borderRadius: 999}}>
                        {/* <Text style={styles.progressTitle}>Calories / {calorieGoal}</Text> */}
                        <Circle
                            progress={(Number(calories || 0) / (calorieGoal || 1)) > 1 ? 1 : (Number(calories || 0) / (calorieGoal || 1))}
                            size={120}
                            thickness={10}
                            borderWidth={0}
                            color="#20ca17"
                            animated
                            showsText
                            formatText={() => `${calories}`}
                            textStyle={{ fontSize: 32 }}
                        />
                    </View>

                    {isNutritionLoading ? (    
                        <ActivityIndicator size="small" color="#20ca17" style={{ position: "absolute", bottom: 0 }} />
                    ) : null}

                    <View style={{backgroundColor: "#4a9eff20", borderRadius: 999}}>
                        {/* <Text style={styles.progressTitle}>Protein / {proteinGoal}</Text> */}
                        <Circle
                            progress={(Number(protein || 0) / (proteinGoal || 1)) > 1 ? 1 : (Number(protein || 0) / (proteinGoal || 1))}
                            size={120}
                            thickness={10}
                            borderWidth={0}
                            color="#4a9eff"
                            animated
                            showsText
                            formatText={() => `${protein}`}
                            textStyle={{ fontSize: 32 }}
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
                            styles.actionButton,
                            { marginTop: 0 }
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
                            styles.actionButton,
                            { marginTop: 0 }
                        ]}
                    >
                        <Entypo name="plus" size={20} color="black" style={{ textAlign: "center", margin: "auto" }} />
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                style={CommonStyles.scrollview}
                contentContainerStyle={CommonStyles.scrollViewContentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Charts</Text>

                <View style={CommonStyles.componentContainer}>
                    <NutritionChart 
                        history={nutrition}
                    />
                </View>
            </ScrollView>

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
                                setIsMenuVisible(false);
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
                                resetNutrition();
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
                    </Animated.View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    nutritionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        gap: 24,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
        color: "#f1f1f1",
    },
    buttonContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
    },
    actionButton: {
        width: 55,
        height: 55,
    },
});
