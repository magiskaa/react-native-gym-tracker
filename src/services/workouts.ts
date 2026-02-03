import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export type Workout = {
    id: number;
    name: string;
    duration: string;
    date: string;
};

export const getWorkouts = async (userId: string): Promise<Workout[]> => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return []; 
    }
    const { data, error } = await supabase
        .from("workouts")
        .select(`id, name, duration, date`)
        .eq(`userId`, userId)
        .order("date", { ascending: false });
    if (error) {
        Alert.alert("getWorkouts", error.message);
        return [];
    }
    return data as Workout[];
};

export const addWorkout = async (userId: string, name: string, duration: string, date: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return null;
    }
    const { data, error } = await supabase
        .from("workouts")
        .insert({ userId, name, duration, date })
        .select("id")
        .single();
    if (error) {
        Alert.alert("addWorkout", error.message);
        return null;
    }
    return data?.id ?? null;
};

