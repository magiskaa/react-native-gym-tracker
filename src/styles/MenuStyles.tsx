import { StyleSheet } from "react-native";

export const MenuStyles = StyleSheet.create({
	menuOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		justifyContent: "flex-start",
		alignItems: "flex-end",
		paddingTop: 72,
		paddingRight: 42,
	},
	menu: {
		backgroundColor: "#181818",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#393939",
		minWidth: "50%",
		overflow: "hidden",
	},
	menuItem: {
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#2b2b2b",
	},
	menuText: {
		color: "#f1f1f1",
		fontSize: 18,
		fontWeight: "600",
	},
});