import { StyleSheet, Text, View, Pressable, FlatList, Dimensions, Alert } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import LogCaloriesModal from "../modal/Nutrition/LogCaloriesModal";
import SetNutritionGoalsModal from "../modal/Nutrition/SetNutritionGoalsModal";
import { formatDateWOZeros, formatLocalDateISO } from "../utils/Utils";
import NutritionChart from "../components/Nutrition/NutritionChart";
import { CommonStyles } from "../styles/CommonStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { Nutrition, getNutrition, getNutritionByDate, addNutrition, updateNutrition } from "../services/nutrition";
import { getNutritionGoals, updateNutritionGoals, addNutritionGoals } from "../services/nutritionGoals";
import { useToast } from "../components/ToastConfig";


export default function NutritionScreen() {
    const [nutrition, setNutrition] = useState<Nutrition[]>([]);
    const { session } = useAuthContext();

    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
    const [proteinGoal, setProteinGoal] = useState<number | null>(null);

    const [calories, setCalories] = useState<number>(0);
    const [protein, setProtein] = useState<number>(0);
    const [date, setDate] = useState<Date>(new Date());
    const today = formatLocalDateISO(new Date());

    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState<boolean>(false);

    const [isRemoveActive, setIsRemoveActive] = useState<boolean>(false);

    const windowWidth = Dimensions.get("window").width;

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
    }, []);

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

    return (
        <View style={[CommonStyles.container, { paddingHorizontal: 0 }]}>
            <View style={styles.nutritionContainer}>
                <View style={styles.progressContainer}>
                    <View>
                        <Text style={styles.progressTitle}>Calories</Text>
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
                            style={styles.progress}
                        />
                    </View>
                    <Text style={[styles.progressTitle, { position: "absolute", top: -16 }]}>{formatDateWOZeros(formatLocalDateISO(new Date()))}</Text>
                    <View>
                        <Text style={styles.progressTitle}>Protein</Text>
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
                            style={styles.progress}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable 
                        onPress={() => {
                            openGoalModal(); 
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                        }}
                        style={({ pressed }) => [
                            CommonStyles.button,
                            pressed && CommonStyles.buttonPressed,
                            { width: "35%" }
                        ]}
                    >
                        <Text style={CommonStyles.buttonText}>Set goals</Text>
                    </Pressable>

                    <Pressable 
                        onPress={() => {
                            openModal(); 
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                        }}
                        style={({ pressed }) => [
                            CommonStyles.button,
                            pressed && CommonStyles.buttonPressed,
                            { width: "35%" }
                        ]}
                    >
                        <Text style={CommonStyles.buttonText}>Log calories</Text>
                    </Pressable>
                </View>
            </View>
            
            <FlatList
                data={nutrition.slice(1, 7)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.date}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    return (
                        <View style={styles.recentDaysContainer}>
                            <Text style={styles.dateText}>{formatDateWOZeros(item.date)}</Text>
                            <View style={styles.progressContainer}>
                                <View>
                                    <Text style={styles.progressTitleSmall}>Calories</Text>
                                    <Circle
                                        progress={(Number(item.calories || 0) / (calorieGoal || 3000)) > 1 ? 1 : (Number(item.calories || 0) / (calorieGoal || 3000))}
                                        size={60}
                                        thickness={5}
                                        borderWidth={0}
                                        color="#20ca17"
                                        animated
                                        showsText
                                        formatText={() => `${(item.calories || 0)}`}
                                        textStyle={{ fontSize: 18 }}
                                        style={styles.progress}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.progressTitleSmall}>Protein</Text>
                                    <Circle
                                        progress={(Number(item.protein || 0) / (proteinGoal || 150)) > 1 ? 1 : (Number(item.protein || 0) / (proteinGoal || 150))}
                                        size={60}
                                        thickness={5}
                                        borderWidth={0}
                                        color="#4a9eff"
                                        animated
                                        showsText
                                        formatText={() => `${(item.protein || 0)}`}
                                        textStyle={{ fontSize: 18 }}
                                        style={styles.progress}
                                    />
                                </View>
                            </View>
                        </View>
                    )
                }}
                contentContainerStyle={[CommonStyles.listContent, { paddingHorizontal: 8 }]}
                ListEmptyComponent={
                    <Text style={[CommonStyles.empty, { marginHorizontal: windowWidth / 2 - 75 }]}>No data from recent days</Text>
                }
            />

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
        </View>
    );
}

const styles = StyleSheet.create({
    nutritionContainer: {
        marginBottom: 0,
        paddingBottom: 14,
        width: "100%",
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 22,
        fontWeight: 600,
        textAlign: "center",
        marginVertical: 10,
        color: "#f1f1f1",
    },
    progress: {
        marginHorizontal: 8,
    },
    buttonContainer: {
        flexDirection: "row",
    },
    recentDaysContainer: {
        backgroundColor: "#2b2b2b",
        padding: 2,
        width: 160,
        borderRadius: 12,
        marginHorizontal: 4,
        marginVertical: 12,
    },
    dateText: {
        fontSize: 22,
        fontWeight: 500,
        textAlign: "center",
        margin: "auto",
        marginTop: 8,
        marginBottom: 4,
        color: "#f1f1f1",
    },
    progressTitleSmall: {
        fontSize: 18,
        textAlign: "center",
        marginVertical: 8,
        color: "#f1f1f1",
    },
});
