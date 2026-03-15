import { useEffect, useRef, useState } from "react";
import {
	Pressable,
	Text,
	View,
	Alert,
	ScrollView,
	Animated,
	Modal
} from "react-native";
import * as Haptics from 'expo-haptics';
import ExerciseSelectModal from "../modal/Workout/ExerciseSelectModal";
import { CommonStyles } from "../styles/CommonStyles";
import { useAuthContext } from "../auth/UseAuthContext";
import { Exercise, getExercises } from "../services/exercises";
import { BlurView } from "expo-blur";
import { Entypo } from "@expo/vector-icons";
import { MenuStyles } from "../styles/MenuStyles";
import { useNavigation } from "@react-navigation/native";
import { WorkoutStackParamList } from "../navigation/WorkoutStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { addFavoriteExercises, FavoriteExercises, getFavoriteExercises } from "../services/favoriteExercises";
import { useToast } from "../components/ToastConfig";
import { addSet } from "../services/sets";
import { formatLocalDateISO } from "../utils/Utils";
import { addWorkout } from "../services/workouts";
import { addWorkoutExercise } from "../services/workoutExercises";
import { useWorkoutSelection } from "../context/WorkoutContext";
import { BlurHeaderProps } from "../utils/Types";
import ActiveWorkoutContainer from "../components/Workout/ActiveWorkoutContainer";


type MenuModalProps = {
	isMenuVisible: boolean;
	menuAnim: Animated.Value;
	closeMenu: () => void;
}

function BlurHeader({ openMenu } : BlurHeaderProps) {
	return (
		<BlurView
			tint="dark"
			intensity={50}
			style={CommonStyles.blurView}
		>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.headerTitle}>Workout</Text>
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						openMenu();
					}}
					style={({ pressed }) => [
						pressed && CommonStyles.buttonPressed,
						{ padding: 8 }
					]}
				> 
					<Entypo name="dots-three-vertical" size={24} color="#f1f1f1" />
				</Pressable>
			</View>
		</BlurView>
	);
}

function MenuModal({ isMenuVisible, menuAnim, closeMenu } : MenuModalProps) {
	return (
		<Modal
			transparent
			visible={isMenuVisible}
			animationType="fade"
			onRequestClose={closeMenu}
		>
			<Pressable style={MenuStyles.menuOverlay} onPress={closeMenu}>
				<Animated.View
					style={[
						MenuStyles.menu,
						{
							opacity: menuAnim,
							transform: [{ scale: menuAnim }],
						}
					]}
				>
					<Pressable
						onPress={() => {
							closeMenu();
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}}
						style={({ pressed }) => [
							MenuStyles.menuItem,
							pressed && CommonStyles.buttonPressed
						]}
					>
						<Text style={MenuStyles.menuText}>Something</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							closeMenu();
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						}}
						style={({ pressed }) => [
							MenuStyles.menuItem,
							pressed && CommonStyles.buttonPressed, 
							{ borderBottomWidth: 0 }
						]}
					>
						<Text style={MenuStyles.menuText}>Something else</Text>
					</Pressable>
				</Animated.View>
			</Pressable>
		</Modal>
	);
}

export default function WorkoutScreen() {
	const { session } = useAuthContext();
	const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList, "WorkoutMain">>();
	const [error, setError] = useState<string | null>(null);

	const { 
		selectedIds, 
		setSelectedIds, 
		toggleExercise, 
		isWorkoutActive, 
		startWorkoutSession, 
		resetWorkoutSession, 
		workoutName, 
		updateWorkoutName 
	} = useWorkoutSelection();
	
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	
	const [exercises, setExercises] = useState<Exercise[] | null>([]);
	const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
	
	const selectedCount = selectedIds.size;
	
	const [favoriteExercises, setFavoriteExercises] = useState<FavoriteExercises[]>([]);

	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const menuAnim = useRef(new Animated.Value(0)).current;


	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsExercisesLoading(false);
			return;
		}

		try {
			setIsExercisesLoading(true);
			const exerciseData = await getExercises(session.user.id);
			setExercises(exerciseData);

			let favoriteExerciseData = await getFavoriteExercises(session.user.id);
			if (!favoriteExerciseData || favoriteExerciseData.length === 0) {
				favoriteExerciseData = await addFavoriteExercises(session.user.id, null);
			}
			setFavoriteExercises(favoriteExerciseData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		} finally {
			setIsExercisesLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user.id) {
			loadData();
		}
	}, [session?.user.id]);	

	const startWorkout = () => {
		if (selectedIds.size === 0) {
			setError("Select at least one exercise");
			return;
		}
	
		if (!isWorkoutActive) {
			startWorkoutSession(selectedIds);
			closeModal();
			navigation.navigate("ActiveWorkout", {
				exercises,
				favoriteExercises,
				deleteWorkout,
				endWorkout,
			});
		} else {
			setError("Workout is already active");
		}
	};

	const deleteWorkout = () => {
		resetWorkoutSession();
		navigation.navigate("WorkoutMain");
		useToast("success", "Workout deleted", "Your workout was deleted succesfully");
	};

	const endWorkout = async (duration: string, name: string, setsByExercise: Record<string, { reps: string; weight: string }[]>) => {
		if (!exercises) {
			setError("No exercises selected");
			return;
		}

		const selectedExercises = exercises.filter((ex) => selectedIds.has(ex.id));
		const hasInvalidSet = selectedExercises.some((exercise) => {
			const sets = setsByExercise[exercise.id] ?? [];

			if (sets.length === 0) {
				return true;
			}

			const noRepsOrWeight = sets.some((set) => !set.reps.trim() || !set.weight.trim());
			const invalidRepsOrWeight = sets.some((set) => Number(set.reps.trim()) > 500 || Number(set.weight.trim()) > 1000);

			return noRepsOrWeight || invalidRepsOrWeight;
		});

		if (hasInvalidSet) {
			setError("You have not entered reps and weight for all sets, or some fields have invalid inputs");
			Alert.alert("Invalid fields");
			return;
		}

		try {
			if (!session?.user.id) {
				useToast("error", "No user id found", "Please log in again");
				return;
			}

			const date = formatLocalDateISO(new Date());
			const workoutName = name.trim() || "Workout";

			const workoutId = await addWorkout(session.user.id, workoutName, duration, date);
			if (!workoutId) {
				useToast("error", "Adding workout failed", "Please try again");
				return;
			}

			for (const exercise of selectedExercises) {
				const workoutExerciseId = await addWorkoutExercise(workoutId, exercise.id);
				if (!workoutExerciseId) {
					useToast("error", "Adding workout exercise failed", "Please try again");
					return;
				}

				const sets = setsByExercise[exercise.id] ?? [];
				for (const set of sets) {
					const reps = Number(set.reps);
					const weight = Number(set.weight.replace(",", "."));

					if (Number.isNaN(reps) || Number.isNaN(weight)) {
						continue;
					}

					await addSet(workoutExerciseId, reps, weight);
				}
			}

			resetWorkoutSession();
			navigation.navigate("WorkoutMain");
			useToast("success", "Workout logged", "Your workout was added succesfully");

		} catch (error) {
			Alert.alert("Failed to save workout", "Please try again");
			console.error("Failed to save workout", error);
		}
	};

	const openModal = () => {
		setError(null);
		setIsModalVisible(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openMenu = () => {
		menuAnim.setValue(0);
		setIsMenuVisible(true);
		Animated.spring(menuAnim, {
			toValue: 1,
			friction: 10,
			tension: 140,
			useNativeDriver: true,
		}).start();
	};

	const closeMenu = () => {
		Animated.timing(menuAnim, {
			toValue: 0,
			duration: 120,
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				setIsMenuVisible(false);
			}
		});
	};

	return (
		<View style={CommonStyles.container}>
			
			<BlurHeader openMenu={openMenu} />

			<MenuModal
				isMenuVisible={isMenuVisible}
				menuAnim={menuAnim}
				closeMenu={closeMenu}
			/>

			<ScrollView
				style={CommonStyles.scrollView}
				contentContainerStyle={CommonStyles.scrollViewContentContainer}
				showsVerticalScrollIndicator={false}
			>
				<View style={[CommonStyles.componentContainer, CommonStyles.section]}>
					{isWorkoutActive ? (
						<ActiveWorkoutContainer 
							exercises={exercises}
							favoriteExercises={favoriteExercises}
							navigation={navigation}
							deleteWorkout={deleteWorkout}
							endWorkout={endWorkout}
						/>
					) : (
						<View>
							<Text style={CommonStyles.text}>No Active Workout</Text>
							<Pressable 
								onPress={() => {
									openModal();
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
								}}
								style={({ pressed }) => [
									CommonStyles.button,
									pressed && CommonStyles.buttonPressed
								]}
							>
								<Text style={CommonStyles.buttonText}>Log workout</Text>
							</Pressable>
						</View>
					)}
				</View>

				<View style={CommonStyles.section}>
					<Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Preset Workouts</Text>
					<View style={CommonStyles.componentContainer}>

					</View>
				</View>
			</ScrollView>

			<ExerciseSelectModal
                visible={isModalVisible}
                exercises={exercises}
				isLoading={isExercisesLoading}
				isWorkoutActive={false}
                selectedIds={selectedIds}
                selectedCount={selectedCount}
                error={error}
				workoutName={workoutName}
				updateWorkoutName={updateWorkoutName}
				setSelectedIds={setSelectedIds}
                onToggleExercise={toggleExercise}
                onClose={closeModal}
                onConfirm={startWorkout}
            />
		</View>
	);
}
