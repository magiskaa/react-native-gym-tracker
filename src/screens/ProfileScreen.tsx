import { Pressable, StyleSheet, Text, View, Alert, Button, Image } from "react-native";
import { useState, useEffect } from "react";
import WeightChart from "../components/WeightChart";
import LogWeightModal from "../modal/LogWeightModal";
import { WeightHistory, addWeight, getWeight } from "../services/database";
import * as ImagePicker from 'expo-image-picker';


export default function ProfileScreen() {
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<WeightHistory[]>([]);
	const [isWeightModalVisible, setIsWeightModalVisible] = useState<boolean>(false);
	const [weightInput, setWeightInput] = useState<string>("");
	const [dateInput, setDateInput] = useState<Date>(new Date());
	const [image, setImage] = useState<string | null>(null);
	
	const loadHistory = async () => {
		try {
			const data = await getWeight();
			setHistory(data);
		} catch (err) {
			console.error("Failed to load weight history", err);
		}
	};

	useEffect(() => {
		loadHistory();
	}, []);
	
	const pickImage = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			Alert.alert('Permission required', 'Permission to access the media library is required.');
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images', 'videos'],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};


	const logWeight = async () => {
		if (!weightInput) {
			setError("Fill weight");
			return;
		}

		try {
			const date = dateInput.toISOString().substring(0, 10);
			const weight = Number(weightInput.replace(",", "."));

			await addWeight(date, weight);
			await loadHistory();
		} catch (error) {
			setError(`Failed to log weight: ${error}`);
		} finally {
			setIsWeightModalVisible(false);
			setWeightInput("");
		}
	};

	const closeModal = () => {
		setIsWeightModalVisible(false);
		setError(null);
		setWeightInput("");
	};

	const openModal = () => {
		setIsWeightModalVisible(true);
		setError(null);
	};

	return (
		<View style={styles.container}>
			<Button title="Select image" onPress={pickImage} />
      		{image && <Image source={{ uri: image }} style={styles.image} />}

			<WeightChart 
				history={history}
			/>

			<Pressable style={styles.logButton} onPress={openModal}>
				<Text style={styles.logButtonText}>Log weight</Text>
			</Pressable>

			{error && !isWeightModalVisible ? <Text style={styles.error}>{error}</Text> : null}

			{isWeightModalVisible ? (
				<LogWeightModal 
					visible={isWeightModalVisible}
					error={error}
					weightInput={weightInput}
					dateInput={dateInput}
					setWeightInput={setWeightInput}
					setDateInput={setDateInput}
					onClose={closeModal}
					onConfirm={logWeight}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
    error: {
        color: "#b00020",
        marginBottom: 12,
        textAlign: "center"
    },
	image: {
		width: 200,
		height: 200,
		borderRadius: 999,
		margin: "auto",
		marginTop: 10,
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
