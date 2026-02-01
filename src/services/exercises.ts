import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export type Exercise = {
    id: number;
    name: string;
    muscleGroup: string;
};

export const getExercises = async (userId: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return null;
    }
    const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscleGroup")
        .or(`userId.eq.${userId},userId.is.null`)
        .order("name", { ascending: true });
    if (error) {
        Alert.alert("getExercises", error.message);
        return null;
    }
    return data;
};

export const addExercise = async (userId: string, name: string, muscleGroup: string) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return null; 
    }
    const { error } = await supabase
        .from("exercises")
        .insert({ userId, name, muscleGroup });
    if (error) {
        Alert.alert("addExercise", error.message);
        return;
    }
};

export const getExerciseHistory = async (exerciseId: number) => {
    const { data, error } = await supabase.rpc("get_exercise_history", { exercise_id: exerciseId });
    if (error) {
        Alert.alert("getExerciseHistory", error.message);
        return null;
    }

    return (data ?? []).map((row: { date: string; totalreps: number; totalweight: number; setcount: number }) => {
        const [month, day] = row.date.slice(5).split("-");
        const avgReps = row.setcount ? Math.round((row.totalreps / row.setcount) * 10) / 10 : 0;
        const avgWeight = row.setcount ? Math.round((row.totalweight / row.setcount) * 10) / 10 : 0;

        return {
            date: `${parseInt(day)}.${parseInt(month)}.`,
            avgReps,
            avgWeight,
        };
    });
};
