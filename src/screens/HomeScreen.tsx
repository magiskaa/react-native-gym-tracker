import { Text, View, Alert, ScrollView, Pressable, Modal, Animated } from "react-native";
import { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from 'expo-haptics';
import SetsPerWeek from "../components/Home/SetsPerWeek";
import RecentWorkouts from "../components/Home/RecentWorkouts";
import WorkoutsPerWeekChart from "../components/Home/WorkoutsPerWeekChart";
import { CommonStyles } from "../styles/CommonStyles";
import { Workout, getWorkouts } from "../services/workouts";
import { SetCount, getSetCountsForCurrentWeek } from "../services/sets";
import { useAuthContext } from "../auth/UseAuthContext";
import { Entypo } from "@expo/vector-icons";
import { MenuStyles } from "../styles/MenuStyles";
import { BlurView } from "expo-blur";
import { muscleGroups } from "../utils/Const";
import { BlurHeaderProps } from "../utils/Types";


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
				<Text style={CommonStyles.headerTitle}>Home</Text>
				<Pressable
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

export default function HomeScreen() {
	const { session } = useAuthContext();
	const [setCounts, setSetCounts] = useState<SetCount[]>([]);
	const [workouts, setWorkouts] = useState<Workout[]>([]);
	const [isHomeLoading, setIsHomeLoading] = useState<boolean>(true);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const menuAnim = useRef(new Animated.Value(0)).current;

	const userId = session?.user.id ?? null;

	const loadData = useCallback(async () => {
		if (!userId) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsHomeLoading(false);
			return; 
		}

		try {
			setIsHomeLoading(true);

			const [setData, workoutData] = await Promise.all([
				getSetCountsForCurrentWeek(),
				getWorkouts(userId),
			]);

			const setCountMap = new Map(setData.map(item => [item.muscle_group, item.set_count]));
			const fullSetCounts = muscleGroups.map(group => ({
				muscleGroup: group,
				setCount: setCountMap.get(group) || 0
			}));

			setSetCounts(fullSetCounts);
			setWorkouts(workoutData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		} finally {
			setIsHomeLoading(false);
		}
	}, [userId]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData])
	);

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
				<View style={CommonStyles.section}>
					<Text style={CommonStyles.title}>Weekly Sets</Text>
					<SetsPerWeek 
						setCounts={setCounts}
						isLoading={isHomeLoading}
					/>
				</View>

				<View style={CommonStyles.section}>
					<Text style={CommonStyles.title}>Weekly Workouts</Text>
					<View style={CommonStyles.componentContainer}>
						<WorkoutsPerWeekChart 
							workouts={workouts}
							isLoading={isHomeLoading}
						/>
					</View>
				</View>

				<View style={CommonStyles.section}>
					<Text style={CommonStyles.title}>Recent Workouts</Text>
					<RecentWorkouts 
						workouts={workouts}
						isLoading={isHomeLoading}
					/>
				</View>
			</ScrollView>
		</View>
	);
}
