import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";


export type Nutrition = {
    date: string;
    calories: number | null;
    protein: number | null;
};

export const getNutrition = async (userId: string): Promise<Nutrition[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("nutrition")
        .select(`date, calories, protein`)
        .order("date", { ascending: false });
    if (error) {
        Alert.alert("getNutrition", error.message);
        return [];
    }
    return data as Nutrition[];
};

export const getNutritionByDate = async (userId: string, date: string): Promise<Nutrition[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("nutrition")
        .select(`date, calories, protein`)
        .eq("date", date)
        .eq("userId", userId)
        .limit(1);
    if (error) {
        Alert.alert("getNutritionByDate", error.message);
        return [];
    }
    return data as Nutrition[];
};

export const addNutrition = async (
    userId: string, 
    date: string, 
    calories: number | null = null, 
    protein: number | null = null
): Promise<Nutrition[]> => {

    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { error } = await supabase
        .from("nutrition")
        .insert({ userId, date, calories, protein });
    if (error) {
        Alert.alert("addNutrition", error.message);
        return [];
    }
    return getNutritionByDate(userId, date);
};

export const updateNutrition = async (userId: string, date: string, calories: number, protein: number) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("nutrition")
        .update({ calories, protein })
        .eq("date", date)
        .eq("userId", userId);
    if (error) {
        Alert.alert("updateNutrition", error.message);
        return;
    }
};
