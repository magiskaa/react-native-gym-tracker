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
import { WeightHistory, addWeight, getWeight, getProfile, updateProfile } from "../services/database";
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../auth/authContext';


export default function ProfileScreen() {
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<WeightHistory[]>([]);
	const [isWeightModalVisible, setIsWeightModalVisible] = useState<boolean>(false);
	
	const [weightInput, setWeightInput] = useState<string>("");
	const [dateInput, setDateInput] = useState<Date>(new Date());

	const [profileId, setProfileId] = useState<number>(0);

	const { user, saveUser, logout } = useAuth();
	const username = user?.username || "";
	const image = user?.image || null;

	const [editedUsername, setEditedUsername] = useState<string>(username);
	const [editedImage, setEditedImage] = useState<string | null>(image);

	const [originalUsername, setOriginalUsername] = useState<string>("");
	const [originalImage, setOriginalImage] = useState<string | null>(null);

	const [isEditable, setIsEditable] = useState<boolean>(false);
	const [editButtonColor, setEditButtonColor] = useState<string>("#1e1e1e");
	
	const loadData = async () => {
		try {
			const weightData = await getWeight();
			setHistory(weightData);

			const profileData = await getProfile(username);
			if (profileData.length === 0) { return; }

			setProfileId(profileData[0].id);
			if (profileData[0].image) {
				setEditedImage(profileData[0].image);
			}
		} catch (err) {
			console.error("Failed to load weight history", err);
		}
	};

	useEffect(() => {
		loadData();
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
			setEditedImage(result.assets[0].uri);
		}
	};

	const saveChanges = async () => {
		if (user) {
			await saveUser({ ...user, username: editedUsername, image: editedImage });
			await updateProfile(profileId, { username: editedUsername, image: editedImage });
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
			await loadData();
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
				<Pressable style={styles.logoutButton} onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
					Alert.alert(
						"Logout?", "Are you sure you want to logout?", 
						[{ text: "No", style: "cancel" }, { text: "Yes", onPress: logout }], 
						{ cancelable: true }
					)
				}}>
					<MaterialIcons name="logout" size={24} color="#1e1e1e" />
				</Pressable>

				{isEditable ? (
					<View style={styles.selectImageButton}>
						<Button title="Select image" onPress={() =>{ pickImage(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}} />
					</View>
				) : null}
				{(editedImage) ? (
					<Image source={{ uri: editedImage }} style={styles.image}/>
				) : (
					<View style={[styles.image, { backgroundColor: "#d0d0d0" }]}>
						<Ionicons name={"person"} size={150} color={"#9f9f9f"} style={{ margin: "auto" }} />
					</View>
				)}

				<Pressable style={styles.editButton} onPress={() => {
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
					if (isEditable) {
						Alert.alert(
							"Save profile", "Are you sure you want to save the changes?", 
							[
								{ 
									text: "No", 
									style: "cancel",
									onPress: () => {
										setEditedUsername(originalUsername);
										setEditedImage(originalImage);
										setIsEditable(false);
										setEditButtonColor("#1e1e1e");
									}
								},
								{ 
									text: "Yes", 
									onPress: async () => {
										await saveChanges();
										setIsEditable(false);
										setEditButtonColor("#1e1e1e");
									}
								}
							], 
							{ cancelable: true }
						)
						return;
					}
					setOriginalUsername(editedUsername);
					setOriginalImage(editedImage);
					setIsEditable(true);
					setEditButtonColor("#20ca17");
				}}>
					<FontAwesome6 name={isEditable ? "save" : "pencil"} size={24} color={editButtonColor} />
				</Pressable>

				<View style={styles.usernameContainer}>
					{isEditable ? (
						<TextInput 
							value={editedUsername}
							onChangeText={setEditedUsername}
							placeholder="Username"
							autoCapitalize="none"
							placeholderTextColor="#8b8b8b"
							style={styles.input}
						/>
					) : (
						<Text style={styles.username}>{username}</Text>
					)}
				</View>

				<WeightChart history={history} />
				<Pressable style={styles.logButton} onPress={() => { openModal(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}>
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
	logoutButton: {
		position: "absolute",
		top: 8,
		left: 8,
	},
	image: {
		width: 200,
		height: 200,
		borderRadius: 999,
		margin: "auto",
		marginTop: 30,
		marginBottom: 20,
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
		right: 24,
		top: "34%",
	},
	selectImageButton: {
		position: "absolute",
		right: "40%",
		top: 10,
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
