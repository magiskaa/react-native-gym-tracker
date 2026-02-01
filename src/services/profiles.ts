import { supabase } from "./supabase";
import { Alert } from "react-native";
import { useToast } from "../components/ToastConfig";

export const getProfile = async (userId: string) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return null; 
    }
    const { data, error } = await supabase
        .from("profiles")
        .select(`userId, username, image`)
        .eq(`userId`, userId)
        .maybeSingle();
    if (error) {
        Alert.alert("getProfile", error.message);
        return null;
    }
    return data;
};

export const addProfile = async (userId: string, username: string, image: string | null = null) => {
    if (!userId) {
        useToast("error", "No user id found", "Please log in again");
        return;
    }
    const { error } = await supabase
        .from("profiles")
        .insert({ userId, username, image });
    if (error) {
        Alert.alert("addProfile", error.message);
        return;
    }
};

export const updateProfile = async (userId: string, username: string, image: string | null) => {
    if (!userId) { 
        useToast("error", "No user id found", "Please log in again");
        return; 
    }
    const { error } = await supabase
        .from("profiles")
        .update({ username, image })
        .eq("userId", userId);
    if (error) {
        Alert.alert("updateProfile", error.message);
        return;
    }
};
