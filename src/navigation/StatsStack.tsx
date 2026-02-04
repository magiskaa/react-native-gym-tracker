import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StatsScreen from "../screens/StatsScreen";
import ExerciseStatsScreen from "../screens/ExerciseStatsScreen";

export type StatsStackParamList = {
    StatsList: undefined;
    ExerciseStats: {
        exerciseId: number;
        name: string;
        muscleGroup: string;
    };
};

const Stack = createNativeStackNavigator<StatsStackParamList>();

export default function StatsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="StatsList" component={StatsScreen} />
            <Stack.Screen
                name="ExerciseStats"
                component={ExerciseStatsScreen}
                options={{
                    animation: "slide_from_right",
                }}
            />
        </Stack.Navigator>
    );
}
