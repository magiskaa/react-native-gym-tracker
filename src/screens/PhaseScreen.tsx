import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as Haptics from 'expo-haptics';
import { Circle } from "react-native-progress";
import { NutritionRow, getNutrition, getNutritionByDate, addNutrition, updateNutrition } from "../services/database";
import { useAuth } from "../auth/AuthContext";
import LogCaloriesModal from "../modal/LogCaloriesModal";

export default function PhaseScreen() {
	const [nutrition, setNutrition] = useState<NutritionRow[]>([]);
	const { user } = useAuth();

	const [calories, setCalories] = useState<number>(0);
	const [protein, setProtein] = useState<number>(0);
	const [date, setDate] = useState<Date>(new Date());
	const today = new Date().toISOString().slice(0, 10);

	const [error, setError] = useState<string | null>(null);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const loadData = async () => {
		try {
			let nutritionData = await getNutrition(user.id);

			if (nutritionData.length > 0) {
				if (nutritionData[0].date !== today) {
					nutritionData = await addNutrition(user.id, today);
				}
			}
			if (nutritionData.length === 0) {
				nutritionData = await addNutrition(user.id, today);
			}
			console.log(nutritionData)

			setNutrition(nutritionData);
			setCalories(nutritionData[0].calories || 0);
			setProtein(nutritionData[0].protein || 0);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const logCalories = async (cal: number, prot: number) => { 
		const formattedDate = date.toISOString().slice(0, 10);

		try {
			if (date.toISOString().slice(0, 10) !== today) {
				let nutritionData = await getNutritionByDate(user.id, formattedDate);

				if (nutritionData.length === 0) {
					nutritionData = await addNutrition(user.id, formattedDate);
				}

				const caloriesMap = new Map(nutritionData.map(row => [row.date, row.calories]))
				const proteinMap = new Map(nutritionData.map(row => [row.date, row.protein]))
				const c = (caloriesMap.get(formattedDate) || 0);
				const p = (proteinMap.get(formattedDate) || 0);
				await updateNutrition(user.id, c + cal, p + prot, formattedDate);
				return;
			}
			await updateNutrition(user.id, calories + cal, protein + prot, formattedDate);
			setCalories(calories + cal);
			setProtein(protein + prot);
		} catch (error) {
			setError(`Failed to log calories: ${error}`);
		} finally {
			closeModal();
		}
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setError(null);
	};

	const openModal = () => {
		setIsModalVisible(true);
		setError(null);
	};

	return (
		<View style={styles.container}>
			<View style={styles.nutritionContainer}>
				<View style={styles.progressContainer}>
					<View>
						<Text style={styles.progressTitle}>Calories</Text>
						<Circle
							progress={(Number(calories || 0) / 3000) > 1 ? 1 : (Number(calories || 0) / 3000)}
							size={120}
							thickness={10}
							borderWidth={0}
							color="#20ca17"
							animated
							showsText
							formatText={() => `${calories}`}
							style={styles.progress}
						/>
					</View>
					<View>
						<Text style={styles.progressTitle}>Protein</Text>
						<Circle
							progress={(Number(protein || 0) / 150) > 1 ? 1 : (Number(protein || 0) / 150)}
							size={120}
							thickness={10}
							borderWidth={0}
							color="#20ca17"
							animated
							showsText
							formatText={() => `${protein}`}
							style={styles.progress}
						/>
					</View>
				</View>

				<Pressable  
					style={styles.logButton} 
					onPress={() => {
						openModal(); 
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
					}}
				>
					<Text style={styles.logButtonText}>Log calories</Text>
				</Pressable>
			</View>
			
			<ScrollView>
				<View style={{ width: 200, height: 100, backgroundColor: "#1e1e1e", borderRadius: 12, marginTop: 12 }}></View>
				<View style={{ width: 200, height: 100, backgroundColor: "#1e1e1e", borderRadius: 12, marginTop: 12 }}></View>
				<View style={{ width: 200, height: 100, backgroundColor: "#1e1e1e", borderRadius: 12, marginTop: 12 }}></View>
				<View style={{ width: 200, height: 100, backgroundColor: "#1e1e1e", borderRadius: 12, marginTop: 12 }}></View>
				<View style={{ width: 200, height: 100, backgroundColor: "#1e1e1e", borderRadius: 12, marginTop: 12 }}></View>
			</ScrollView>

			{isModalVisible ? (
				<LogCaloriesModal 
					visible={isModalVisible}
					error={error}
					dateInput={new Date(date)}
					setDateInput={setDate}
					onClose={closeModal}
					onConfirm={logCalories}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-start",
		padding: 16,
	},
	nutritionContainer: {
		marginBottom: 0,
		borderBottomWidth: 1,
		paddingBottom: 18,
		borderColor: "#2c2c2c",
		width: "100%",
	},
	progressContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginBottom: 8,
	},
	progressTitle: {
		fontSize: 22,
		textAlign: "center",
		marginVertical: 10,
	},
	progress: {
		marginHorizontal: 8,
	},
	logButton: {
		backgroundColor: "#20ca17",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
		margin: "auto",
		marginTop: 10,
	},
	logButtonText: {
		color: "#ffffff",
		fontWeight: "600",
		textAlign: "center",
	},
});
