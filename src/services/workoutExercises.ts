import { supabase } from "./supabase";
import { Alert } from "react-native";

export const addWorkoutExercise = async (workoutId: number, exerciseId: number) => {
    const { data, error } = await supabase
        .from("workoutExercises")
        .insert({ workoutId, exerciseId })
        .select("id")
        .single();
    if (error) {
        Alert.alert("addWorkoutExercise", error.message);
        return null;
    }
    return data?.id ?? null;
};

