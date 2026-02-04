import { Pressable, StyleSheet, Text, View, Alert, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { CommonStyles } from "../styles/CommonStyles";
import { NutritionStackParamList } from "../navigation/NutritionStack";
import { useAuthContext } from "../auth/UseAuthContext";
import { formatDateWOZeros } from "../utils/Utils";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useToast } from "../components/ToastConfig";
import { deleteNutritionByDate, Nutrition } from "../services/nutrition";
import { useState } from "react";


export default function ExerciseStatsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<NutritionStackParamList>>();
    const route = useRoute<RouteProp<NutritionStackParamList, "NutritionHistory">>();
    const { nutrition } = route.params;
    const [nutritionList, setNutritionList] = useState<Nutrition[]>(nutrition);
    const { session } = useAuthContext();

    const deleteNutritionDay = async (date: string) => {
		if (!session?.user.id) { 
			Alert.alert("Failed to delete nutrition day", "Please sign in again");
			return; 
		}

        try {
            await deleteNutritionByDate(session.user.id, date);
            useToast("success", "Nutrition day deleted", "Your nutrition day was deleted successfully");
            setNutritionList((prev) => prev.filter((item) => item.date !== date));

        } catch (error) {
            useToast("error", "Failed to delete nutrition day", "Please try again");
            console.error(`Failed to add exercise: ${error}`);
        }
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
                    <Text style={styles.title}>Nutrition History</Text>
                </View>
            </View>

            <FlatList
                data={nutritionList}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.date}
                style={CommonStyles.list}
                renderItem={({ item }) => {	
                    return (
                        <View style={styles.historyContainer}>
                            <Text style={styles.dateText}>{formatDateWOZeros(item.date)}</Text>
                            <View style={styles.nutritionContainer}>
                                <View>
                                    <Text style={styles.nutritionTitle}>Calories</Text>
                                    <Text style={[styles.nutritionNumber, { color: "#20ca17" }]}>{item.calories}</Text>
                                </View>
                                <View>
                                    <Text style={styles.nutritionTitle}>Protein</Text>
                                    <Text style={[styles.nutritionNumber, { color: "#4a9eff" }]}>{item.protein}</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                    Alert.alert(
                                        "Delete day?", "Are you sure you want to delete this day?", 
                                        [{ text: "No", style: "cancel" }, { text: "Yes", onPress: () => deleteNutritionDay(item.date) }],
                                        { cancelable: true }
                                    )
                                }}
                                style={({ pressed }) => [
                                    styles.deleteButton,
                                    pressed && CommonStyles.buttonPressed, 
                                    { borderBottomWidth: 0 }
                                ]}
                            >
                                <FontAwesome6 name="trash-can" size={24} color="red" />
                            </Pressable>
                        </View>
                    )
                }}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={CommonStyles.empty}>No data from recent days</Text>
                }
            />
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
    historyContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#2b2b2b",
        padding: 8,
		marginVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#393939",
        marginHorizontal: 6,
    },
    dateText: {
        fontSize: 22,
        fontWeight: 600,
        textAlign: "center",
        marginVertical: "auto",
        marginLeft: 16,
        color: "#f1f1f1",
    },
    nutritionContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        gap: 24,
    },
    nutritionTitle: {
        fontSize: 20,
        textAlign: "center",
        marginVertical: 6,
        color: "#f1f1f1",
    },
    nutritionNumber: {
        fontSize: 28,
        textAlign: "center",
        marginBottom: 4,
    },
    deleteButton: {
        marginVertical: "auto",
        marginRight: 16,
    },
	listContent: {
		paddingBottom: 24,
	},
});
