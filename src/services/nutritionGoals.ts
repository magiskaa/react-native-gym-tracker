import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";


export type NutritionGoals = {
    calorieGoal: number | null;
    proteinGoal: number | null;
};

export const getNutritionGoals = async (userId: string): Promise<NutritionGoals[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("nutritionGoals")
        .select(`calorieGoal, proteinGoal`);
    if (error) {
        Alert.alert("getNutritionGoals", error.message);
        return [];
    }
    return data as NutritionGoals[];
};

export const addNutritionGoals = async (userId: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("nutritionGoals")
        .insert({ userId, calorieGoal: null, proteinGoal: null });
    if (error) {
        Alert.alert("addNutritionGoals", error.message);
        return;
    }
};

export const updateNutritionGoals = async (userId: string, calorieGoal: number, proteinGoal: number) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("nutritionGoals")
        .update({ calorieGoal, proteinGoal })
        .eq("userId", userId);
    if (error) {
        Alert.alert("updateNutritionGoals", error.message);
        return;
    }
};
