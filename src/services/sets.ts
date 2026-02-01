import { supabase } from "./supabase";
import { Alert } from "react-native";

export const addSet = async (workoutExerciseId: string, reps: number, weight: number) => {
    const { error } = await supabase
        .from("sets")
        .insert({ workoutExerciseId, reps, weight });
    if (error) {
        Alert.alert("addSet", error.message);
        return;
    }
};

