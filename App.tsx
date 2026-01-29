import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/ToastConfig';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import NutritionScreen from './src/screens/NutritionScreen';
import PhaseScreen from "./src/screens/PhaseScreen";
import StatsScreen from "./src/screens/StatsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { useAuthContext } from './src/auth/UseAuthContext';
import AuthProvider from './src/auth/AuthProvider';

const Tab = createBottomTabNavigator();

const Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "#1e1e1e",
        card: "#2b2b2b",
        text: "#f1f1f1"
    }
}

function AppContent() {
    const { session, isLoading } = useAuthContext();

    if (!session?.user.id && !isLoading) {
        return <LoginScreen />;
    }

    return (
        <NavigationContainer theme={Theme}>
            <StatusBar style="light" />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: "#20ca17",
                    tabBarInactiveTintColor: "#e3e3e3",
                    tabBarIcon: ({ color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case "Home":
                                iconName = "home";
                                break;
                            case "Workout":
                                iconName = "barbell";
                                break;
                            case "Nutrition":
                                iconName = "nutrition";
                                break;
                            case "Phase":
                                iconName = "fitness";
                                break;
                            case "Stats":
                                iconName = "stats-chart";
                                break;
                            case "Profile":
                            default:
                                iconName = "person";
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
                screenListeners={{
                    tabPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
                    },
                }}
            >
                {/* <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Workout" component={WorkoutScreen} />
                <Tab.Screen name="Nutrition" component={NutritionScreen} />
                <Tab.Screen name="Phase" component={PhaseScreen} />
                <Tab.Screen name="Stats" component={StatsScreen} /> */}
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
            <Toast config={toastConfig} />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
