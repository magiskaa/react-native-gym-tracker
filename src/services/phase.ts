import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";
import { formatLocalDateISO } from "../utils/Utils";


export type Phase = {
    id: number;
    type: string;
    startDate: string;
    endDate: string | null;
    startingWeight: number;
    weightGoal: number | null;
};

export const getCurrentPhase = async (userId: string): Promise<Phase[]> => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const today = formatLocalDateISO(new Date());
    const { data, error } = await supabase
        .from("phase")
        .select(`id, type, startDate, endDate, startingWeight, weightGoal`)
        .eq("userId", userId)
        .or(`endDate.is.null,endDate.gte.${today}`)
        .order("startDate", { ascending: false })
        .limit(1);
    if (error) {
        Alert.alert("getCurrentPhase", error.message);
        return [];
    }
    return data as Phase[];
};

export const addPhase = async (
    userId: string, 
    type: string, 
    startDate: string, 
    startingWeight: number, 
    endDate: string | null = null, 
    weightGoal: number | null = null
) => {

    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("phase")
        .insert({ userId, type, startDate, endDate, startingWeight, weightGoal });
    if (error) {
        Alert.alert("addNutrition", error.message);
        return;
    }
};

export const updatePhase = async (
    userId: string,
    id: number,
    type: string, 
    startDate: string, 
    endDate: string | null, 
    startingWeight: number, 
    weightGoal: number | null  
) => {

    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("nutrition")
        .update({ type, startDate, endDate, startingWeight, weightGoal })
        .eq("userId", userId)
        .eq("id", id);
    if (error) {
        Alert.alert("updatePhase", error.message);
        return;
    }
};



export const getCurrentPhaseWeight = async (userId: string, startDate: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("weights")
        .select(`weight, date`)
        .eq("userId", userId)
        .gte("date", startDate);
    if (error) {
        Alert.alert("getCurrentPhaseWeight", error.message);
        return [];
    }
    return data;
};
