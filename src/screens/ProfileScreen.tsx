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
import WeightChart from "../components/Profile/WeightChart";
import LogWeightModal from "../modal/Profile/LogWeightModal";
import { WeightHistory, addWeight, getWeight } from "../services/weights";
import { getProfile, addProfile, updateProfile } from "../services/profile";
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../auth/authContext';
import { formatLocalDateISO } from "../utils/Utils";
import { CommonStyles } from "../styles/CommonStyles";
import { useToast } from "../components/ToastConfig";


export default function ProfileScreen() {
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<WeightHistory[]>([]);
	const [isWeightModalVisible, setIsWeightModalVisible] = useState<boolean>(false);
	
	const [weightInput, setWeightInput] = useState<string>("");
	const [dateInput, setDateInput] = useState<Date>(new Date());

	const { user, loading, logout } = useAuth();

	const [username, setUsername] = useState<string | null>(null);
	const [image, setImage] = useState<string | null>(null);

	const [originalUsername, setOriginalUsername] = useState<string | null>(null);
	const [originalImage, setOriginalImage] = useState<string | null>(null);

	const [isEditable, setIsEditable] = useState<boolean>(false);
	const [editButtonColor, setEditButtonColor] = useState<string>("#f1f1f1");
	
	const loadData = async () => {
		try {
			if (!user?.uid) { return; }

			const weightData = await getWeight(user.uid);
			setHistory(weightData);

			const profileData = await getProfile(user.uid);
			if (profileData.length > 0) {
				setUsername(profileData[0].username);
				if (profileData[0].image) {
					setImage(profileData[0].image);
				}
			}
		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		}
	};

	useEffect(() => {
		if (!loading) {
			loadData();
		}
	}, [loading, user?.uid]);
	
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
		if (!user?.uid) { 
			useToast("error", "Save failed", "Your changes could not be saved");
			return; 
		}

		const existing = await getProfile(user.uid);

		try {
			if (existing.length > 0) {
				await updateProfile(user.uid, username ?? existing[0].username ?? user.email, image ?? existing[0].image);
			} else {
				await addProfile(user.uid, username ?? user.email ?? "", image);
			}
			useToast("success", "Profile saved", "Your changes were saved succesfully");
		} catch (error) {
			useToast("error", "Failed to save profile", "Please try again" );
			console.error(`Failed to save profile: ${error}`);
		} finally {
			loadData();
		}
	};

	const logWeight = async () => {
		if (!weightInput) {
			setError("Please fill weight");
			return;
		}

		const formattedDate = formatLocalDateISO(dateInput);
        const today = formatLocalDateISO(new Date());

        if (formattedDate.localeCompare(today) > 0) {
            setError("Please select a date that is not in the future");
            return;
        }

		try {
			if (!user?.uid) {
				Alert.alert("Failed to log weight", "Please sign in again");
				return;
			}
			const weight = Number(weightInput.replace(",", "."));
			await addWeight(user.uid, weight, formattedDate);

			closeModal();
			useToast("success", "Weight logged", "Your weight entry was saved successfully");
		} catch (error) {
			useToast("error", "Failed to log weight", "Please try again");
			console.error(`Failed to log weight: ${error}`);
		} finally {
			loadData();
		}
	};

	const closeModal = () => {
		setIsWeightModalVisible(false);
		setError(null);
		setWeightInput("");
		setDateInput(new Date());
	};

	const openModal = () => {
		setIsWeightModalVisible(true);
		setError(null);
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={CommonStyles.container}>
				<Pressable 
					style={styles.logoutButton} 
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
						Alert.alert(
							"Logout?", "Are you sure you want to logout?", 
							[{ text: "No", style: "cancel" }, { text: "Yes", onPress: logout }], 
							{ cancelable: true }
						)
					}}
				>
					<MaterialIcons name="logout" size={24} color="#f1f1f1" />
				</Pressable>

				{isEditable ? (
					<View style={styles.selectImageButton}>
						<Button title="Select image" onPress={() =>{ pickImage(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}} />
					</View>
				) : null}
				{(image) ? (
					<Image source={{ uri: image }} style={styles.image}/>
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
										setUsername(originalUsername);
										setImage(originalImage);
										setIsEditable(false);
										setEditButtonColor("#f1f1f1");
									}
								},
								{ 
									text: "Yes", 
									onPress: async () => {
										await saveChanges();
										setIsEditable(false);
										setEditButtonColor("#f1f1f1");
									}
								}
							], 
							{ cancelable: true }
						)
						return;
					}
					setOriginalUsername(username);
					setOriginalImage(image);
					setIsEditable(true);
					setEditButtonColor("#20ca17");
				}}>
					<FontAwesome6 name={isEditable ? "save" : "pencil"} size={24} color={editButtonColor} />
				</Pressable>

				<View style={styles.usernameContainer}>
					{isEditable ? (
						<TextInput 
							value={username || ""}
							onChangeText={setUsername}
							placeholder="Username"
							autoCapitalize="none"
							placeholderTextColor="#8b8b8b"
							style={[CommonStyles.input, styles.input]}
						/>
					) : (
						<Text style={styles.username}>{username || ""}</Text>
					)}
				</View>

				<WeightChart history={history} />
				<Pressable 
					onPress={() => {
						openModal(); 
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
					}}
					style={({ pressed }) => [
						CommonStyles.button,
						pressed && CommonStyles.buttonPressed
					]}
				>
					<Text style={CommonStyles.buttonText}>Log weight</Text>
				</Pressable>

				{error && !isWeightModalVisible ? <Text style={CommonStyles.error}>{error}</Text> : null}

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
		backgroundColor: "#2b2b2b",
		height: 40,
		borderRadius: 12,
	},
	username: {
		color: "#f1f1f1",
		textAlign: "center",
		fontSize: 22,
		marginVertical: "auto",
	},
	input: {
		width: "100%",
		height: "100%",
		textAlign: "center",
		fontSize: 22,
		backgroundColor: "#2b2b2b",
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
});
