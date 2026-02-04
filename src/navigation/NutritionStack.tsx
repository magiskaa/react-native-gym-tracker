import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NutritionScreen from "../screens/NutritionScreen";
import NutritionHistoryScreen from "../screens/NutritionHistoryScreen";
import { Nutrition } from "../services/nutrition";


export type NutritionStackParamList = {
    NutritionMain: undefined;
    NutritionHistory: {
        nutrition: Nutrition[];
    };
};

const Stack = createNativeStackNavigator<NutritionStackParamList>();

export default function NutritionStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="NutritionMain" component={NutritionScreen} />
            <Stack.Screen
                name="NutritionHistory"
                component={NutritionHistoryScreen}
                options={{
                    animation: "slide_from_right",
                }}
            />
        </Stack.Navigator>
    );
}
