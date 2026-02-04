import { StyleSheet } from "react-native";

export const ModalStyles = StyleSheet.create({
    error: {
        position: "absolute",
        left: 10,
        top: 25,
        color: "#b00020",
        marginRight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#090909",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#f1f1f1",
    },
    modalClose: {
        color: "#767676",
        fontWeight: "500",
        padding: 8,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#2b2b2b",
        paddingTop: 12,
        paddingBottom: 30,
    },
    modalFooterText: {
        color: "#9a9a9a",
    },
    button: {
        backgroundColor: "#20ca17",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: "25%",
    },
    datePicker: {
        marginHorizontal: "auto",
        marginVertical: 12,
    },
});


