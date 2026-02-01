import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export type WeightEntry = {
    weight: number;
    date: string;
};

export const getWeightHistory = async (userId: string, startDate: string | null = null, endDate: string | null = null) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    if (!startDate && !endDate) {
        const { data, error } = await supabase
            .from("weights")
            .select(`weight, date`)
            .order("date", { ascending: true });
        if (error) {
            Alert.alert("getWeightHistory", error.message);
            return;
        }
        return data;
    }
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
