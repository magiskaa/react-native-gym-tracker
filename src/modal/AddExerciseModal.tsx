import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    visible: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function AddExerciseModal({ visible, error, onClose, onConfirm }: Props) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add exercise</Text>

                        <Pressable onPress={onClose}>
                            <Text style={styles.modalClose}>Close</Text>
                        </Pressable>
                    </View>

                    

                    <View style={styles.modalFooter}>

                        <Pressable style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>Add</Text>
                        </Pressable>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    error: {
        color: "#b00020",
        marginBottom: 8,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        //backgroundColor: "rgba(0, 0, 0, 0.55)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#0f0f0f",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        height: "70%",
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
        color: "#ffffff",
    },
    modalClose: {
        color: "#8c8c8c",
        fontWeight: "500",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#1f1f1f",
        paddingTop: 12,
        paddingBottom: 30,
    },
    confirmButton: {
        backgroundColor: "#20ca17",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    confirmButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
});
