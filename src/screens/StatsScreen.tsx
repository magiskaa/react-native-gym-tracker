import { useEffect, useState, useMemo } from "react";
import {
	Alert,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatsStackParamList } from "../navigation/StatsStack";
import Entypo from '@expo/vector-icons/Entypo';


export default function StatsScreen() {
	const [exercises, setExercises] = useState<Exercise[] | null>([]);
	const navigation = useNavigation<NativeStackNavigationProp<StatsStackParamList>>();
	const [error, setError] = useState<string | null>(null);
	const [exerciseName, setExerciseName] = useState<string>("");
	const [muscleGroup, setMuscleGroup] = useState<string>("rinta");

	const { session, isLoading } = useAuthContext();

	const allowedGroups = ["rinta", "olkapäät", "hauis", "ojentajat", "jalat", "selkä", "vatsat"];

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

	const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

	const selectedCount = useMemo(() => selectedGroups.size, [selectedGroups]);

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			return; 
		}

		try {
			const exerciseData = await getExercises(session.user.id);
			setExercises(exerciseData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		}
	};

	useEffect(() => {
		if (!isLoading) {
			loadData();
		}
	}, [isLoading]);

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
			if (!allowedGroups.includes(muscleGroup.toLowerCase())) {
				setError("Please enter a valid muscle group");
				return;
			}
			await addExercise(session.user.id, capitalize(trimmedName), capitalize(muscleGroup));
			
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
		setIsMenuVisible(true);
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
				<Text style={CommonStyles.title}>Exercise Stats</Text>
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
						openMenu();
					}}
					style={({ pressed }) => [
						pressed && CommonStyles.buttonPressed
					]}
				>
					<Entypo name="dots-three-vertical" size={24} color="#f1f1f1" />
				</Pressable>
			</View>
			
			<FlatList
				data={exercises}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => {
					if (!selectedGroups.has(item.muscleGroup.toLowerCase()) && selectedGroups.size !== 0) {
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
								});
							}}
							style={({ pressed }) => [
								CommonStyles.componentContainer,
								pressed && CommonStyles.buttonPressed,
								{ marginBottom: 13 }
							]}
						>
							<View style={styles.cardHeader}>
								<View>
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
					<Text style={CommonStyles.empty}>No exercises yet</Text>
				}
			/>

			{isModalVisible ? (
				<AddExerciseModal 
					visible={isModalVisible}
					error={error}
					exerciseName={exerciseName}
					muscleGroup={muscleGroup}
					allowedGroups={allowedGroups}
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
					<Pressable style={MenuStyles.menu} onPress={() => undefined}>
						<Pressable
							onPress={() => {
								closeMenu();
								openModal();
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
								openFilterModal();
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed
							]}
						>
							<Text style={MenuStyles.menuText}>Filter exercises</Text>
						</Pressable>
						<Pressable
							onPress={() => {
								closeMenu();
								setSelectedGroups(new Set());
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed, 
								{ borderBottomWidth: 0 }
							]}
						>
							<Text style={MenuStyles.menuText}>Clear filters</Text>
						</Pressable>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	listContent: {
		paddingBottom: 24,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
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
