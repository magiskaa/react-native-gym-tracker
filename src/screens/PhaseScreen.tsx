import { StyleSheet, Text, View } from "react-native";

export default function PhaseScreen() {
	return (
		<View style={styles.container}>
			<Text>Phase</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
});
