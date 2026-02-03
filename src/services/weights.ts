import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export type WeightEntry = {
    weight: number;
    date: string;
};

export const getWeightHistory = async (userId: string, startDate: string | null = null, endDate: string | null = null): Promise<WeightEntry[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }

    let query = supabase
        .from("weights")
        .select("weight, date")
        .eq("userId", userId)
        .order("date", { ascending: true });

    if (startDate) {
        query = query.gte("date", startDate);
    }
    if (endDate) {
        query = query.lte("date", endDate);
    }

    const { data, error } = await query;
    if (error) {
        Alert.alert("getWeightHistory", error.message);
        return [];
    }
    return data as WeightEntry[];
};

export const getCurrentWeight = async (userId: string): Promise<WeightEntry[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("weights")
        .select(`weight, date`)
        .eq("userId", userId)
        .order("date", { ascending: false })
        .limit(1);
    if (error) {
        Alert.alert("getCurrentWeight", error.message);
        return [];
    }
    return data as WeightEntry[];
};

export const addWeight = async (userId: string, weight: number, date: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("weights")
        .insert({ userId, weight, date });
    if (error) {
        Alert.alert("addWeight", error.message);
        return;
    }
};
