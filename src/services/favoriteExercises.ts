import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";


export type FavoriteExercises = { 
    favorites: number[] | null;
}

export const getFavoriteExercises = async (userId: string) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return [];
    }
    const { data, error } = await supabase
        .from("favoriteExercises")
        .select("favorites")
        .eq("userId", userId);
    if (error) {
        Alert.alert("getFavoriteExercises", error.message);
        return [];
    }
    return data as { favorites: number[] | null }[];
};

export const addFavoriteExercises = async (userId: string, favorites: number[] | null) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return []; 
    }
    const { error } = await supabase
        .from("favoriteExercises")
        .insert({ userId, favorites });
    if (error) {
        Alert.alert("addFavoriteExercise", error.message);
        return [];
    }
    return getFavoriteExercises(userId);
};

export const updateFavoriteExercises = async (userId: string, favorites: number[] | null) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return null; 
    }
    const { error } = await supabase
        .from("favoriteExercises")
        .update({ favorites })
        .eq("userId", userId);
    if (error) {
        Alert.alert("updateFavoriteExercise", error.message);
        return;
    }
};


