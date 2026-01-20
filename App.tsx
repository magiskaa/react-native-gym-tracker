import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import PhaseScreen from "./src/screens/PhaseScreen";
import StatsScreen from "./src/screens/StatsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { initDb } from "./src/services/database";
import { AuthProvider, useAuth } from './src/auth/authContext';

const Tab = createBottomTabNavigator();

function AppContent() {
    const { token } = useAuth();

    useEffect(() => {
        initDb().catch((error) => {
            console.error("Failed to initialize database", error);
        });
    }, []);

    if (!token) {
        return <LoginScreen />;
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: "#20ca17",
                    tabBarInactiveTintColor: "#686868",
                    tabBarIcon: ({ color, size }) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (route.name) {
                            case "Home":
                                iconName = "home";
                                break;
                            case "Workout":
                                iconName = "barbell";
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
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Workout" component={WorkoutScreen} />
                <Tab.Screen name="Phase" component={PhaseScreen} />
                <Tab.Screen name="Stats" component={StatsScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
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
