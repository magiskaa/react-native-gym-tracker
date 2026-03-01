import { StyleSheet } from "react-native";

export const ModalStyles = StyleSheet.create({
    error: {
        position: "absolute",
        left: 0,
        bottom: 6,
        width: "100%",
        textAlign: "center",
        color: "#b00020",
        marginRight: 20,
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#111111",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#232323"
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#393939",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#f1f1f1",
        marginVertical: 8,
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
        marginTop: 16,
        paddingBottom: 30,
        paddingHorizontal: 6,
    },
    modalFooterText: {
        color: "#9a9a9a",
    },
    button: {
        backgroundColor: "#20ca17",
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: "25%",
    },
    datePicker: {
        marginHorizontal: "auto",
    },
});


