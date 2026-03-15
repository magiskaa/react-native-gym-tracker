import { Pressable, Text, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { CommonStyles } from "../../styles/CommonStyles";
import { muscleGroupColors } from "../../utils/Const";
import { Circle } from "react-native-progress";
import { useWorkoutSelection } from "../../context/WorkoutContext";
import { Exercise } from "../../services/exercises";
import { FavoriteExercises } from "../../services/favoriteExercises";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WorkoutStackParamList } from "../../navigation/WorkoutStack";


type Props = {
    exercises: Exercise[] | null;
    favoriteExercises: FavoriteExercises[];
    navigation: NativeStackNavigationProp<WorkoutStackParamList, "WorkoutMain">;
    deleteWorkout: () => void;
    endWorkout: (
        duration: string, 
        name: string, 
        setsByExercise: Record<string, { reps: string; weight: string }[]>
    ) => void;
}

export default function ActiveWorkoutContainer({ exercises, favoriteExercises, navigation, deleteWorkout, endWorkout } : Props) {
    const { selectedIds, workoutName } = useWorkoutSelection();

    return (
        <View style={[CommonStyles.flexRow, { gap: 16 }]}>
            <View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}>
                
                <View style={{ borderBottomWidth: 1, borderBottomColor: "#393939", padding: 8 }}>
                    <Text style={[CommonStyles.text, { fontSize: 20 }]}>{workoutName || "Workout"}</Text>
                </View>
                
                <View style={{ flex: 1, paddingTop: 16, paddingLeft: 8 }}>
                    {Array.from(selectedIds).map((id) => (
                        <View style={[CommonStyles.flexRow, { marginBottom: 6 }]} key={id} >
                            <View style={[CommonStyles.accent, { height: 14, backgroundColor: muscleGroupColors.get(exercises?.find(ex => ex.id === id)?.muscleGroup || "Chest") }]} />
                            <Text style={[CommonStyles.text, { width: "100%", textAlign: "left", fontSize: 18 }]}>{exercises?.find(ex => ex.id === id)?.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ gap: 32 }}>
                <Circle color="#20ca17" indeterminate indeterminateAnimationDuration={3000} style={{ margin: "auto" }} borderWidth={2} endAngle={0.7} />
                <Pressable 
                    onPress={() => {
                        navigation.navigate("ActiveWorkout", {
                            exercises,
                            favoriteExercises,
                            deleteWorkout,
                            endWorkout,
                        });
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
                    }}
                    style={({ pressed }) => [
                        CommonStyles.button,
                        pressed && CommonStyles.buttonPressed,
                        { marginTop: 0 }
                    ]}
                >
                    <Text style={CommonStyles.buttonText}>Continue</Text>
                </Pressable>
            </View>
        </View>
    );
}