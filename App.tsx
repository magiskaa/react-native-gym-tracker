import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/ToastConfig';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import NutritionStack from './src/navigation/NutritionStack';
import PhaseScreen from "./src/screens/PhaseScreen";
import StatsStack from "./src/navigation/StatsStack";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { useAuthContext } from './src/auth/UseAuthContext';
import AuthProvider from './src/auth/AuthProvider';
import { BlurView } from "expo-blur";


const Tab = createBottomTabNavigator();

const Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "#1b1b1b"
    }
}

function AppContent() {
    const { session, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Theme.colors.background,
            }}>
                <ActivityIndicator size="large" color="#20ca17" />
            </View>
        );
    }

    if (!session?.user.id) {
        return <LoginScreen />;
    }

    return (
        <NavigationContainer theme={Theme}>
            <StatusBar style="light" />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: "#20ca17",
                    tabBarInactiveTintColor: "#e3e3e3",
                    tabBarStyle: {
                        borderTopWidth: 0,
                        shadowOpacity: 0.2,
                        paddingTop: 7,
                        backgroundColor: "transparent",
                        position: "absolute"
                    },
                    tabBarBackground: () => (
                        <BlurView
                            tint="dark"
                            intensity={50}
                            style={{ flex: 1 }}
                        />
                    ),
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
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Workout" component={WorkoutScreen} />
                <Tab.Screen name="Stats" component={StatsStack} />
                <Tab.Screen name="Nutrition" component={NutritionStack} />
                <Tab.Screen name="Phase" component={PhaseScreen} />
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
