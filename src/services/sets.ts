import { supabase } from "./supabase";
import { Alert } from "react-native";
import { formatLocalDateISO } from "../utils/Utils";

export type SetCount = {
	muscleGroup: string; 
	setCount: number;
}

export type DBSetCount = {
	muscle_group: string;
	set_count: number;
}

export const getSetCountsForCurrentWeek = async (): Promise<DBSetCount[]> => {
    const now = new Date();
    const dayIndex = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayIndex);

    const startDate = formatLocalDateISO(monday);
    const endDate = formatLocalDateISO(now);

    const { data, error } = await supabase.rpc("get_set_counts_for_current_week", { start_date: startDate, end_date: endDate });
    if (error) {
        Alert.alert("getSetCountsForCurrentWeek", error.message);
        return [];
    }
    return data as DBSetCount[];
};

export const addSet = async (workoutExerciseId: string, reps: number, weight: number) => {
    const { error } = await supabase
        .from("sets")
        .insert({ workoutExerciseId, reps, weight });
    if (error) {
        Alert.alert("addSet", error.message);
        return;
    }
};

