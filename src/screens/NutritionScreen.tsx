import { StyleSheet, Text, View, Pressable, ScrollView, FlatList } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import { NutritionRow, getNutrition, getNutritionByDate, addNutrition, updateNutrition } from "../services/database";
import { useAuth } from "../auth/AuthContext";
import LogCaloriesModal from "../modal/LogCaloriesModal";
import { formatDate, formatLocalDateISO } from "../utils/Utils";
import NutritionChart from "../components/Nutrition/NutritionChart";
import { CommonStyles } from "../styles/CommonStyles";


export default function NutritionScreen() {
    const [nutrition, setNutrition] = useState<NutritionRow[]>([]);
    const { user } = useAuth();

    const [calories, setCalories] = useState<number>(0);
    const [protein, setProtein] = useState<number>(0);
    const [date, setDate] = useState<Date>(new Date());
    const today = formatLocalDateISO(new Date());

    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const [isRemoveActive, setIsRemoveActive] = useState<boolean>(false);

    const loadData = async () => {
        try {
            let nutritionData = await getNutrition(user.id);

            if (nutritionData.length > 0) {
                if (nutritionData[0].date !== today) {
                    nutritionData = await addNutrition(user.id, today);
                }
            }
            if (nutritionData.length === 0) {
                nutritionData = await addNutrition(user.id, today);
            }

            setNutrition(nutritionData);
            setCalories(nutritionData[0].calories || 0);
            setProtein(nutritionData[0].protein || 0);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const logCalories = async (cal: number, prot: number) => { 
        const formattedDate = formatLocalDateISO(date);

        try {
            if (formatLocalDateISO(date) !== today) {
                let nutritionData = await getNutritionByDate(user.id, formattedDate);

                if (nutritionData.length === 0) {
                    nutritionData = await addNutrition(user.id, formattedDate);
                }

                const caloriesMap = new Map(nutritionData.map(row => [row.date, row.calories]))
                const proteinMap = new Map(nutritionData.map(row => [row.date, row.protein]))
                const c = (caloriesMap.get(formattedDate) || 0);
                const p = (proteinMap.get(formattedDate) || 0);

                if (isRemoveActive) {
                    await updateNutrition(user.id, (c - cal) < 0 ? 0 : (c - cal), (p - prot) < 0 ? 0 : (p - prot), formattedDate);
                } else {
                    await updateNutrition(user.id, c + cal, p + prot, formattedDate);
                }
                return;
            }

            if (isRemoveActive) {
                await updateNutrition(user.id, (calories - cal) < 0 ? 0 : (calories - cal), (protein - prot) < 0 ? 0 : (protein - prot), formattedDate);
            } else {
                await updateNutrition(user.id, calories + cal, protein + prot, formattedDate);
            }

            setCalories(calories + cal);
            setProtein(protein + prot);
        } catch (error) {
            setError(`Failed to log calories: ${error}`);
        } finally {
            closeModal();
            loadData();
        }
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setError(null);
        setIsRemoveActive(false);
    };

    const openModal = () => {
        setIsModalVisible(true);
        setError(null);
        setIsRemoveActive(false);
    };

    return (
        <View style={[CommonStyles.container, { paddingHorizontal: 0 }]}>
            <View style={styles.nutritionContainer}>
                <View style={styles.progressContainer}>
                    <View>
                        <Text style={styles.progressTitle}>Calories</Text>
                        <Circle
                            progress={(Number(calories || 0) / 3000) > 1 ? 1 : (Number(calories || 0) / 3000)}
                            size={120}
                            thickness={10}
                            borderWidth={0}
                            color="#20ca17"
                            animated
                            showsText
                            formatText={() => `${calories}`}
                            textStyle={{ fontSize: 34 }}
                            style={styles.progress}
                        />
                    </View>
                    <View>
                        <Text style={styles.progressTitle}>Protein</Text>
                        <Circle
                            progress={(Number(protein || 0) / 150) > 1 ? 1 : (Number(protein || 0) / 150)}
                            size={120}
                            thickness={10}
                            borderWidth={0}
                            color="#4a9eff"
                            animated
                            showsText
                            formatText={() => `${protein}`}
                            textStyle={{ fontSize: 34 }}
                            style={styles.progress}
                        />
                    </View>
                </View>

                <Pressable  
                    style={CommonStyles.button} 
                    onPress={() => {
                        openModal(); 
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                    }}
                >
                    <Text style={CommonStyles.buttonText}>Log calories</Text>
                </Pressable>
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
                            <Text style={styles.dateText}>{formatDate(item.date).slice(0, 6)}</Text>
                            <View style={styles.progressContainer}>
                                <View>
                                    <Text style={styles.progressTitleSmall}>Calories</Text>
                                    <Circle
                                        progress={(Number(item.calories || 0) / 3000) > 1 ? 1 : (Number(item.calories || 0) / 3000)}
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
                                        progress={(Number(item.protein || 0) / 150) > 1 ? 1 : (Number(item.protein || 0) / 150)}
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
                    <Text style={CommonStyles.empty}>No exercises yet</Text>
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
