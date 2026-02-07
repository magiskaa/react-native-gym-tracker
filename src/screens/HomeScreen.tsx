import { StyleSheet, Text, View, Alert, ScrollView, Pressable, Modal } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from 'expo-haptics';
import SetsPerWeek from "../components/Home/SetsPerWeek";
import RecentWorkouts from "../components/Home/RecentWorkouts";
import { CommonStyles } from "../styles/CommonStyles";
import { Workout, getWorkouts } from "../services/workouts";
import { SetCount, getSetCountsForCurrentWeek } from "../services/sets";
import { useAuthContext } from "../auth/UseAuthContext";
import { Entypo } from "@expo/vector-icons";
import { MenuStyles } from "../styles/MenuStyles";


export default function HomeScreen() {
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);
	const muscleGroups = ["Rinta", "Olkapäät", "Hauis", "Ojentajat", "Jalat", "Selkä", "Vatsat"];

	const { session } = useAuthContext();
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsHomeLoading(false);
			return; 
		}

		try {
			setIsHomeLoading(true);
			const setData = await getSetCountsForCurrentWeek();
			const setCountMap = new Map(setData.map(item => [item.muscle_group, item.set_count]));
			const fullSetCounts = muscleGroups.map(group => ({
				muscleGroup: group,
				setCount: setCountMap.get(group) || 0
			}));
			setSetCounts(fullSetCounts);

			const workoutData = await getWorkouts(session.user.id);
			setWorkouts(workoutData);
		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		} finally {
			setIsHomeLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [session?.user.id])
	);

	const openMenu = () => {
		setIsMenuVisible(true);
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

	return (
		<View style={CommonStyles.container}>
			<View style={CommonStyles.header}>
                <Text style={CommonStyles.title}>Home screen</Text>
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

			<ScrollView style={[CommonStyles.scrollview, { marginTop: 8 }]}>
				<View style={styles.section}>
					<Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Weekly Sets</Text>
					<SetsPerWeek 
						setCounts={setCounts}
						isLoading={isHomeLoading}
					/>
				</View>

				<View style={styles.section}>
					<Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Recent Workouts</Text>
					<RecentWorkouts 
						workouts={workouts}
						isLoading={isHomeLoading}
					/>
				</View>
			</ScrollView>

			<Modal
				transparent
				visible={isMenuVisible}
				animationType="fade"
				onRequestClose={closeMenu}
			>
				<Pressable style={MenuStyles.menuOverlay} onPress={closeMenu}>
					<View style={MenuStyles.menu}>
						<Pressable
							onPress={() => {
								closeMenu();
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed, 
								{ borderBottomWidth: 0 }
							]}
						>
							<Text style={MenuStyles.menuText}>Tohon sitte jotai muuta</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		marginBottom: 16,
	},
});
