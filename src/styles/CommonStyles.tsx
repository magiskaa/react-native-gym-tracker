import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
    container: {
		flex: 1,
		justifyContent: "flex-start",
        paddingHorizontal: 16,
		paddingTop: 64,
	},
	error: {
		color: "#b00020",
		marginBottom: 8,
		textAlign: "center"
	},
	flexRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	blurView: {
		position: "absolute", 
		top: 0, 
		left: 0, 
		right: 0, 
		zIndex: 1, 
		paddingTop: 64, 
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#393939",
	},
	headerTitle: {
	    fontSize: 28,
        marginVertical: 8,
        marginHorizontal: 4,
        fontWeight: "800",
        color: "#f1f1f1",
        letterSpacing: 0.2,
    },
	title: {
        fontSize: 22,
        marginBottom: 16,
        marginHorizontal: 4,
        fontWeight: "700",
        color: "#f1f1f1",
        letterSpacing: 0.3,
    },
	secondTitle: {
		marginBottom: 16,
	},
	scrollView: {
		paddingTop: 68,
	},
	scrollViewContentContainer: {
		paddingBottom: 160,
	},
	section: {
		marginVertical: 12,
	},
	componentContainer: {
        backgroundColor: "#262626",
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
	notActiveText: {
		fontSize: 20,
		fontWeight: "600",
		textAlign: "center",
		margin: "auto",
		marginBottom: 10,
        color: "#f1f1f1"
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		textAlign: "center",
		margin: "auto",
        color: "#f1f1f1"
	},
	button: {
		backgroundColor: "#20ca17",
		borderRadius: 999,
		paddingVertical: 12,
		paddingHorizontal: 16,
		margin: "auto",
		marginTop: 16,
	},
	buttonText: {
		color: "#1e1e1e",
		fontWeight: "700",
		textAlign: "center",
	},
	buttonPressed: {
		opacity: 0.7,
	},
	headerIcon: {
		padding: 8,
	},
	headerIconPressed: {
		transform: [{scale: 1.25}],
	},
	backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#393939",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
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

