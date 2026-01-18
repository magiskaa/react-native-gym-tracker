import { 
	Pressable, 
	StyleSheet, 
	Text, 
	View, 
	Alert, 
	Button, 
	Image, 
	TextInput, 
	TouchableWithoutFeedback, 
	Keyboard
} from "react-native";
import { useState, useEffect } from "react";
import WeightChart from "../components/WeightChart";
import LogWeightModal from "../modal/LogWeightModal";
import { WeightHistory, addWeight, getWeight } from "../services/database";
import * as ImagePicker from 'expo-image-picker';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Ionicons } from "@expo/vector-icons";


export default function ProfileScreen() {
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<WeightHistory[]>([]);
	const [isWeightModalVisible, setIsWeightModalVisible] = useState<boolean>(false);
	
	const [weightInput, setWeightInput] = useState<string>("");
	const [dateInput, setDateInput] = useState<Date>(new Date());

	const [image, setImage] = useState<string | null>(null);
	const [username, setUsername] = useState<string>("");
	const [isEditable, setIsEditable] = useState<boolean>(false);
	const [editButtonColor, setEditButtonColor] = useState<string>("#1e1e1e");
	
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

	const saveChanges = async () => {
		
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
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				{isEditable ? <Button title="Select image" onPress={pickImage} /> : null}
				{image ? (
					<Image source={{ uri: image }} style={styles.image}/>
				) : (
					<View style={[styles.image, { backgroundColor: "#d0d0d0" }]}>
						<Ionicons name={"person"} size={150} color={"#9f9f9f"} style={{ margin: "auto" }} />
					</View>
				)}

				<Pressable style={styles.editButton} onPress={() => {
					if (isEditable) {
						Alert.alert(
							"Save profile", "Are you sure you want to save the changes?", 
							[{ text: "No", style: "cancel" }, { text: "Yes", onPress: saveChanges }], 
							{ cancelable: true }
						)
					}
					setIsEditable(!isEditable);
					if (editButtonColor === "#20ca17") {
						setEditButtonColor("#1e1e1e");
					} else {
						setEditButtonColor("#20ca17");
					}
				}}>
					<FontAwesome6 name="pencil" size={24} color={editButtonColor} />
				</Pressable>

				<View style={styles.usernameContainer}>
					{isEditable ? (
						<TextInput 
							value={username}
							onChangeText={setUsername}
							placeholder="Username"
							placeholderTextColor="#8b8b8b"
							style={styles.input}
						/>
					) : (
						<Text style={styles.username}>{username}</Text>
					)}
				</View>

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
		</TouchableWithoutFeedback>
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
        textAlign: "center",
    },
	image: {
		width: 200,
		height: 200,
		borderRadius: 999,
		margin: "auto",
		marginTop: 10,
	},
	usernameContainer: {
		backgroundColor: "#dedede",
		height: 40,
		borderRadius: 12,
	},
	username: {
		color: "#1e1e1e",
		textAlign: "center",
		fontSize: 22,
		marginVertical: "auto",
	},
	input: {
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		width: "100%",
		height: "100%",
		color: "#1e1e1e",
		textAlign: "center",
		fontSize: 22,
	},
	editButton: {
		position: "absolute",
		right: 16,
		top: 16,
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
