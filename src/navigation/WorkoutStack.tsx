import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavoriteExercises } from "../services/favoriteExercises";
import WorkoutScreen from "../screens/WorkoutScreen";
import ActiveWorkoutScreen from "../screens/ActiveWorkoutScreen";
import { Exercise } from "../services/exercises";
import { WorkoutSelectionProvider } from "../components/Workout/WorkoutContext";


export type WorkoutStackParamList = {
    WorkoutMain: undefined;
    ActiveWorkout: {
        exercises: Exercise[] | null;
        favoriteExercises: FavoriteExercises[];
        deleteWorkout: () => void;
        endWorkout: (
            formattedDuration: string, 
            name: string, 
            setsByExercise: Record<string, { reps: string; weight: string }[]>
        ) => void;
    };
};

const Stack = createNativeStackNavigator<WorkoutStackParamList>();

export default function WorkoutStack() {
    return (
        <WorkoutSelectionProvider>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
                <Stack.Screen
                    name="ActiveWorkout"
                    component={ActiveWorkoutScreen}
                    options={{
                        animation: "slide_from_right",
                    }}
                />
            </Stack.Navigator>
        </WorkoutSelectionProvider>
    );
}
