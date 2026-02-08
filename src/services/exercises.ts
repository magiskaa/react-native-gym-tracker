import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export type Exercise = {
    id: number;
    name: string;
    muscleGroup: string;
    eliteBWRatio: number;
    eliteReps: number;
};

export type ExerciseHistory = {
    date: string;
    total_reps: number;
    total_weight: number;
    set_count: number;
};

export type ExerciseSession = {
    date: string;
    sets: { reps: number; weight: number }[];
};

export const getExercises = async (userId: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return null;
    }
    const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscleGroup, eliteBWRatio, eliteReps")
        .or(`userId.eq.${userId},userId.is.null`)
        .order("name", { ascending: true });
    if (error) {
        Alert.alert("getExercises", error.message);
        return null;
    }
    return data;
};

export const addExercise = async (userId: string, name: string, muscleGroup: string, eliteBWRatio: number | null = null, eliteReps: number | null = null) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return null; 
    }
    const { error } = await supabase
        .from("exercises")
        .insert({ userId, name, muscleGroup, eliteBWRatio, eliteReps });
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

    return (data ?? []).map((row: ExerciseHistory) => {
        const [month, day] = row.date.slice(5).split("-");
        const totalReps = Number(row.total_reps ?? 0);
        const totalWeight = Number(row.total_weight ?? 0);
        const setCount = Number(row.set_count ?? 0);
        const avgReps = setCount ? Math.round((totalReps / setCount) * 10) / 10 : 0;
        const avgWeight = setCount ? Math.round((totalWeight / setCount) * 10) / 10 : 0;

        return {
            date: `${parseInt(day)}.${parseInt(month)}.`,
            avgReps,
            avgWeight,
        };
    });
};

export const getExerciseLastSession = async (exerciseId: number) => {
    const { data, error } = await supabase.rpc("get_exercise_last_session", { exercise_id: exerciseId });
    if (error) {
        Alert.alert("getExerciseLastSession", error.message);
        return null;
    }

    return (data ?? []).map((row: any) => {
        return {
            reps: row.reps,
            weight: row.weight
        };
    });
};

export const getExerciseSessions = async (exerciseId: number) => {
    const { data, error } = await supabase.rpc("get_exercise_sessions", { exercise_id: exerciseId });
    if (error) {
        Alert.alert("getExerciseSessions", error.message);
        return null;
    }
    return data ?? [];
};
