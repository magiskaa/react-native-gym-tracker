import { 
	ActivityIndicator,
	Pressable, 
	StyleSheet, 
	Text, 
	View, 
	Alert, 
	Button, 
	Image, 
	TextInput, 
	TouchableWithoutFeedback, 
	Keyboard,
	Modal,
	ScrollView
} from "react-native";
import { useState, useEffect } from "react";
import WeightChart from "../components/Profile/WeightChart";
import LogWeightModal from "../modal/Profile/LogWeightModal";
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Ionicons } from "@expo/vector-icons";
import { formatLocalDateISO } from "../utils/Utils";
import { CommonStyles } from "../styles/CommonStyles";
import { ChartStyles } from "../styles/ChartStyles";
import { useToast } from "../components/ToastConfig";
import { supabase } from "../services/supabase";
import { useAuthContext } from "../auth/UseAuthContext";
import { updateProfile, addProfile } from "../services/profiles";
import { WeightEntry, getWeightHistory, addWeight } from "../services/weights";
import { Entypo } from "@expo/vector-icons";
import { MenuStyles } from "../styles/MenuStyles";
import { BlurView } from "expo-blur";


export default function ProfileScreen() {
	const [error, setError] = useState<string | null>(null);
	const [history, setHistory] = useState<WeightEntry[] | undefined>([]);
	const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
	const [isWeightModalVisible, setIsWeightModalVisible] = useState<boolean>(false);
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	
	const [weightInput, setWeightInput] = useState<string>("");
	const [dateInput, setDateInput] = useState<Date>(new Date());

	const { profile, session } = useAuthContext();

	const [username, setUsername] = useState<string | null>(null);
	const [image, setImage] = useState<string | null>(null);

	const [originalUsername, setOriginalUsername] = useState<string | null>(null);
	const [originalImage, setOriginalImage] = useState<string | null>(null);

	const [isEditable, setIsEditable] = useState<boolean>(false);

	const loadData = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to load data", "Please sign in again");
			setIsHistoryLoading(false);
			return; 
		}

		try {
			if (profile) {
				setUsername(profile.username ?? null);
				setImage(profile.image ?? null);
			}

			setIsHistoryLoading(true);
			const weightData = await getWeightHistory(session.user.id);
			setHistory(weightData);

		} catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
		} finally {
			setIsHistoryLoading(false);
		}
	}; 
	
	useEffect(() => {
		if (session?.user.id) {
			loadData();
		}
	}, [session?.user.id]);
	
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

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			useToast("error", "Error signing out", "Please try again");
			console.error('Error signing out:', error);
		}
	};

	const saveChanges = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to save changes", "Please sign in again");
			return; 
		}

		try {
			if (profile) {
				await updateProfile(session.user.id, username ?? session.user.email ?? "", image ?? null);
			} else {
				await addProfile(session.user.id, username ?? session.user.email ?? "", image ?? null);
			}
			useToast("success", "Profile saved", "Your changes were saved succesfully");
		
		} catch (error) {
			useToast("error", "Failed to save profile", "Please try again" );
			console.error(`Failed to save profile: ${error}`);
		}
	};

	const logWeight = async () => {
		if (!session?.user.id) { 
			Alert.alert("Failed to log weight", "Please sign in again");
			closeModal();
			return; 
		}

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
			const weight = Number(weightInput.replace(",", "."));
			await addWeight(session.user.id, weight, formattedDate);

			closeModal();
			loadData();
			useToast("success", "Weight logged", "Your weight entry was added successfully");

		} catch (error) {
			useToast("error", "Failed to log weight", "Please try again");
			console.error(`Failed to log weight: ${error}`);
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

	const openMenu = () => {
		setIsMenuVisible(true);
	};

	const closeMenu = () => {
		setIsMenuVisible(false);
	};

	return (
		<View style={CommonStyles.container}>
			<BlurView
				tint="dark"
				intensity={50}
				style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, paddingTop: 64, paddingHorizontal: 16 }}
			>
				<View style={CommonStyles.header}>
					<Text style={CommonStyles.headerTitle}>Profile</Text>
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

			<ScrollView
				style={{ paddingTop: 56 }}
				contentContainerStyle={CommonStyles.scrollViewContentContainer}
				showsVerticalScrollIndicator={false}
			>
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

				{isEditable ? (
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
										}
									},
									{ 
										text: "Yes", 
										onPress: async () => {
											await saveChanges();
											setIsEditable(false);
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
					}}>
						<FontAwesome6 name={"save"} size={24} color={"#20ca17"} />
					</Pressable>
				) : null}

				<View style={[CommonStyles.componentContainer, styles.usernameContainer]}>
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
			
				<Text style={[CommonStyles.title, CommonStyles.secondTitle]}>Weight chart</Text>
				{isHistoryLoading ? (
					<View style={ChartStyles.emptyContainer}>
						<ActivityIndicator size="small" color="#20ca17" />
					</View>
				) : (
					<View style={CommonStyles.componentContainer}>
						<WeightChart history={history ?? []} />

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
					</View>
				)}
			</ScrollView>

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
								setOriginalUsername(username);
								setOriginalImage(image);
								setIsEditable(true);
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed
							]}
						>
							<Text style={MenuStyles.menuText}>Edit profile</Text>
						</Pressable>
						<Pressable
							onPress={() => {
								closeMenu();
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
								Alert.alert(
									"Logout?", "Are you sure you want to logout?", 
									[{ text: "No", style: "cancel" }, { text: "Yes", onPress: signOut }], 
									{ cancelable: true }
								);
							}}
							style={({ pressed }) => [
								MenuStyles.menuItem,
								pressed && CommonStyles.buttonPressed, 
								{ borderBottomWidth: 0 }
							]}
						>
							<Text style={MenuStyles.menuText}>Log out</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	logoutButton: {
		position: "absolute",
		top: 72,
		left: 16,
	},
	image: {
		width: 200,
		height: 200,
		borderRadius: 999,
		margin: "auto",
		marginVertical: 16,
	},
	usernameContainer: {
		height: 40,
		padding: 0,
		marginBottom: 16,
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
		top: 190,
	},
	selectImageButton: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
		top: -10,
	},
});
