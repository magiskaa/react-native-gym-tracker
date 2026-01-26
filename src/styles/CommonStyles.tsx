import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
    container: {
		flex: 1,
		justifyContent: "flex-start",
        padding: 16,
	},
	error: {
		color: "#b00020",
		marginBottom: 8,
		textAlign: "center"
	},
    title: {
        fontSize: 24,
        marginTop: 12,
		marginBottom: 4,
		marginHorizontal: 12,
        fontWeight: "600",
        color: "#f1f1f1",
    },
	input: {
		backgroundColor: "#1e1e1e",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
        marginBottom: 20,
		color: "#f1f1f1",
	},
	notActiveContainer: {
		width: "100%",
		height: "100%",
	},
	text: {
		fontSize: 20,
		fontWeight: 600,
		textAlign: "center",
		margin: "auto",
		marginBottom: 10,
        color: "#f1f1f1"
	},
	button: {
		backgroundColor: "#20ca17",
		borderRadius: 10,
		paddingVertical: 12,
		paddingHorizontal: 16,
		margin: "auto",
		marginTop: 10,
	},
	buttonText: {
		color: "#f1f1f1",
		fontWeight: "600",
		textAlign: "center",
	},
	buttonPressed: {
		opacity: 0.7,
	},
    listContent: {
        flexDirection: "row",
        flexWrap: "nowrap",
        flexGrow: 0,
    },
    list: {
        flexGrow: 0,
    },
    empty: {
        color: "#6b6b6b",
        textAlign: "center",
        marginTop: 24,
    },
});

