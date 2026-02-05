import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
    container: {
		flex: 1,
		justifyContent: "flex-start",
        padding: 16,
		paddingTop: 72,
	},
	error: {
		color: "#b00020",
		marginBottom: 8,
		textAlign: "center"
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	title: {
        fontSize: 22,
        marginVertical: 8,
        marginHorizontal: 4,
        fontWeight: "700",
        color: "#f1f1f1",
        letterSpacing: 0.3,
    },
	secondTitle: {
		marginBottom: 16,
	},
	scrollview: {
		borderRadius: 16,
		marginTop: 16,
	},	
	componentContainer: {
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#393939",
        padding: 16,
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
		fontWeight: "600",
		textAlign: "center",
		margin: "auto",
		marginBottom: 10,
        color: "#f1f1f1"
	},
	button: {
		backgroundColor: "#20ca17",
		borderRadius: 999,
		paddingVertical: 12,
		paddingHorizontal: 16,
		margin: "auto",
		marginTop: 10,
	},
	buttonText: {
		color: "#1e1e1e",
		fontWeight: "700",
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

