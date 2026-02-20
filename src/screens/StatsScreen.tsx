import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
	Animated
} from "react-native";
import * as Haptics from 'expo-haptics';
import AddExerciseModal from "../modal/Stats/AddExerciseModal";
import FilterExercisesModal from "../modal/Stats/FilterExercisesModal";
import { CommonStyles } from "../styles/CommonStyles";
import { MenuStyles } from "../styles/MenuStyles";
import { capitalize } from "../utils/Utils";
import { useToast } from "../components/ToastConfig";
import { useAuthContext } from "../auth/UseAuthContext";
import { Exercise, getExercises, addExercise } from "../services/exercises";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useFocusEffect, useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatsStackParamList } from "../navigation/StatsStack";
import Entypo from '@expo/vector-icons/Entypo';
import { FavoriteExercises, getFavoriteExercises, addFavoriteExercises, updateFavoriteExercises } from "../services/favoriteExercises";
import { BlurView } from "expo-blur";
import Feather from '@expo/vector-icons/Feather';


export default function StatsScreen() {
	const [exercises, setExercises] = useState<Exercise[] | null>(null);
	const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(true);
	
	const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList, "StatsList">>();
	const route = useRoute<RouteProp<StatsStackParamList, "StatsList">>();
	const [error, setError] = useState<string | null>(null);
	const [exerciseName, setExerciseName] = useState<string>("");
	const [muscleGroup, setMuscleGroup] = useState<string>("chest");

	const { session } = useAuthContext();

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
	
	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const menuAnim = useRef(new Animated.Value(0)).current;

	const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
	const selectedCount = useMemo(() => selectedGroups.size, [selectedGroups]);

	const [favoriteExercises, setFavoriteExercises] = useState<FavoriteExercises[]>([]);
	const [isFavoritesActive, setIsFavoritesActive] = useState<boolean>(false);
	const [isFavoriteExercisesLoading, setIsFavoriteExercisesLoading] = useState<boolean>(true);

	const muscleGroupColors = new Map([
		["Chest", "#9f0fca"],
		["Shoulders", "#0c3ed5"],
		["Biceps", "#ffd700"],
		["Triceps", "#47db16"],
		["Legs", "#f00707"],
		["Back", "#2f8507"],
		["Abs", "#ea0a58"]
	]);

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsExercisesLoading(false);
			setIsFavoriteExercisesLoading(false);
			return; 
		}

		try {
			setIsExercisesLoading(true);
			const exerciseData = await getExercises(session.user.id);
			setExercises(exerciseData);

			setIsFavoriteExercisesLoading(true);
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
			setIsFavoriteExercisesLoading(false);
		}
	};

	useEffect(() => {
		if (session?.user.id) {
			loadData();
		}
	}, [session?.user.id]);

	useEffect(() => {
		const openExercise = route.params?.openExercise;
		if (openExercise) {
			navigation.navigate("ExerciseStats", openExercise);
			navigation.setParams({ openExercise: undefined });
		}
	}, [route.params?.openExercise, navigation]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [session?.user.id])
	);

	const handleAddExercise = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to add exercise", "Please sign in again");
			return; 
		}

		try {
			const trimmedName = exerciseName.trim();
			if (!trimmedName) {
				setError("Please enter a name");
				return;
			}
			
			await addExercise(session.user.id, capitalize(trimmedName), capitalize(muscleGroup), null, null);
			
			closeModal();
			loadData();
			useToast("success", "Exercise added", "Your exercise was added succesfully");

		} catch (error) {
			useToast("error", "Failed to add exercise", "Please try again");
			console.error(`Failed to add exercise: ${error}`);
		}
	};

	const toggleGroup = (name: string) => {
		setSelectedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(name)) {
				next.delete(name);
			} else {
				next.add(name);
			}
			return next;
		});
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setIsFilterModalVisible(false);
		setIsMenuVisible(false);
		setError(null);
		setExerciseName("");
		setMuscleGroup("");
	};

	const openModal = () => {
		setIsModalVisible(true);
	};

	const openFilterModal = () => {
		setIsFilterModalVisible(true);
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
				intensity={60}
				style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, paddingTop: 64, paddingHorizontal: 16 }}
			>
				<View style={[CommonStyles.header, { gap: 8 }]}>
					<Text style={[CommonStyles.headerTitle, { flex: 1 }]}>Exercise Stats</Text>
					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							openFilterModal();
						}}
						style={({ pressed }) => [
							pressed && CommonStyles.buttonPressed,
							{ padding: 8 }
						]}
					>
						<Feather name="filter" size={24} color="#f1f1f1" />
					</Pressable>

					<Pressable
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							setIsFavoritesActive(!isFavoritesActive);
						}}
						style={({ pressed }) => [
							pressed && CommonStyles.buttonPressed,
							{ padding: 8 }
						]}
					>
						{isFavoritesActive ? (
							<Entypo name="heart" size={26} color="#f1f1f1" />
						) : (
							<Entypo name="heart-outlined" size={26} color="#f1f1f1" />
						)}
					</Pressable>

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

			<FlatList
				data={exercises ?? []}
                showsVerticalScrollIndicator={false}
				keyExtractor={(item) => item.id.toString()}
                style={CommonStyles.list}
				renderItem={({ item }) => {
					if (!selectedGroups.has(item.muscleGroup.toLowerCase()) && selectedGroups.size !== 0) {
						return (<View></View>);
					}
					if (isFavoritesActive && !favoriteExercises[0].favorites?.includes(item.id)) {
						return (<View></View>);
					}

					return (
						<Pressable
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
								navigation.navigate("ExerciseStats", {
									exerciseId: item.id,
									name: item.name,
									muscleGroup: item.muscleGroup,
									eliteBWRatio: item.eliteBWRatio,
									eliteReps: item.eliteReps,
						            favoriteExercises: favoriteExercises[0],
								});
							}}
							style={({ pressed }) => [
								CommonStyles.componentContainer,
								pressed && CommonStyles.buttonPressed,
								{ marginBottom: 13, flexDirection: "row", alignItems: "center" }
							]}
						>
							<View style={[styles.accent, { backgroundColor: muscleGroupColors.get(item.muscleGroup) }]} />
							<View style={styles.cardHeader}>
								<View style={{ gap: 2 }}>
									<Text style={styles.cardTitle}>{item.name}</Text>
									<Text style={styles.cardSubtitle}>
										{item.muscleGroup}
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={18} color="#6f6f6f" />
							</View>
						</Pressable>
					);
				}}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					isExercisesLoading ? (
						<ActivityIndicator size="small" color="#20ca17" />
					) : (
						<Text style={CommonStyles.empty}>No exercises yet</Text>
					)
				}
			/>

			{isModalVisible ? (
				<AddExerciseModal 
					visible={isModalVisible}
					error={error}
					exerciseName={exerciseName}
					muscleGroup={muscleGroup}
					setExerciseName={setExerciseName}
					setMuscleGroup={setMuscleGroup}
					onClose={closeModal}
					onConfirm={handleAddExercise}
				/>
			) : null}

			{isFilterModalVisible ? (
				<FilterExercisesModal 
					visible={isFilterModalVisible}
					error={error}
					selectedGroups={selectedGroups}
					selectedCount={selectedCount}
					onToggleGroup={toggleGroup}
					onClose={closeModal}
				/>
			) : null}

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
								setIsMenuVisible(false);
								openModal();
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed
							]}
						>
							<Text style={MenuStyles.menuText}>Add exercise</Text>
						</Pressable>
						<Pressable
							onPress={() => {
								closeMenu();
								setSelectedGroups(new Set());
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed, 
								{ borderBottomWidth: 0 }
							]}
						>
							<Text style={MenuStyles.menuText}>Clear filters</Text>
						</Pressable>
					</Animated.View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	listContent: {
		paddingTop: 80,
		paddingBottom: 160,
	},
    accent: {
        width: 6,
        height: "90%",
        borderRadius: 6,
        marginRight: 10,
    },
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		flex: 1,
	},
	cardTitle: {
		color: "#f1f1f1",
		fontSize: 18,
		fontWeight: "600",
	},
	cardSubtitle: {
		color: "#767676",
		fontSize: 15,
	},
});
