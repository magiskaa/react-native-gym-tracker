import { useEffect, useMemo, useRef, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	View,
	Alert,
	ScrollView,
	Animated,
	Modal
} from "react-native";
import * as Haptics from 'expo-haptics';
import ExerciseSelectModal from "../modal/Workout/ExerciseSelectModal";
import ActiveWorkout from "../components/Workout/ActiveWorkout";
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


export default function WorkoutScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<WorkoutStackParamList, "WorkoutMain">>();
	const [error, setError] = useState<string | null>(null);
	const { session } = useAuthContext();

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
	const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);

	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const selectedCount = selectedIds.size;
	
	const [exercises, setExercises] = useState<Exercise[] | null>([]);
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

	const toggleExercise = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const startWorkout = () => {
		if (selectedIds.size === 0) {
			setError("Select at least one exercise");
			return;
		}
	
		if (!isWorkoutActive) {
			setIsWorkoutActive(true);
			setError(null);
			closeModal();
			navigation.navigate("ActiveWorkout", {
				exercises,
				favoriteExercises,
				selectedIds,
				setSelectedIds,
				setIsModalVisible,
				deleteWorkout,
				endWorkout,
			});
		} else {
			setError("Workout is already active");
		}
	};

	const deleteWorkout = () => {
		setIsWorkoutActive(false);
		setSelectedIds(new Set());
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

			setIsWorkoutActive(false);
			setSelectedIds(new Set());
			navigation.navigate("WorkoutMain");
			useToast("success", "Workout logged", "Your workout was added succesfully");

		} catch (error) {
			Alert.alert("Failed to save workout", "Please try again");
			console.error("Failed to save workout", error);
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setError(null);
		setIsModalVisible(true);
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
							<Text style={MenuStyles.menuText}>Tähän vaikka jotain</Text>
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
							<Text style={MenuStyles.menuText}>Tohon sitte jotai muuta</Text>
						</Pressable>
					</Animated.View>
				</Pressable>
			</Modal>

			<ScrollView
				style={CommonStyles.scrollView}
				contentContainerStyle={CommonStyles.scrollViewContentContainer}
				showsVerticalScrollIndicator={false}
			>
				<View style={[CommonStyles.componentContainer, CommonStyles.section]}>
					{isWorkoutActive ? (
						<View style={CommonStyles.flexRow}>
							<Text style={CommonStyles.text}>Workout Active</Text>
							<Pressable 
								onPress={() => {
									navigation.navigate("ActiveWorkout", {
										exercises,
										favoriteExercises,
										selectedIds,
										setSelectedIds,
										setIsModalVisible,
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
					<Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Jotaki</Text>
					<View style={CommonStyles.componentContainer}>

					</View>
				</View>
			</ScrollView>

			<ExerciseSelectModal
                visible={isModalVisible}
                exercises={exercises}
				isLoading={isExercisesLoading}
				isWorkoutActive={isWorkoutActive}
                selectedIds={selectedIds}
                selectedCount={selectedCount}
                error={error}
				setSelectedIds={setSelectedIds}
                onToggleExercise={toggleExercise}
                onClose={closeModal}
                onConfirm={startWorkout}
            />
		</View>
	);
}
