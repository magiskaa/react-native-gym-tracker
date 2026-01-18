import { 
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    Keyboard, 
    TouchableWithoutFeedback 
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
    visible: boolean;
    error: string | null;
    weightInput: string;
    dateInput: Date;
    setWeightInput: (weight: string) => void;
    setDateInput: (date: Date) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function LogWeightModal({ 
    visible, 
    error, 
    weightInput, 
    dateInput, 
    setWeightInput, 
    setDateInput, 
    onClose,
    onConfirm
}: Props) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Log weight</Text>

                            <Pressable onPress={onClose}>
                                <Text style={styles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <TextInput 
                            value={weightInput}
                            onChangeText={setWeightInput}
                            placeholder="Weight (kg)"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <DateTimePicker
                            value={dateInput}
                            onChange={(event, selectedDate) => {
                                if (selectedDate) setDateInput(selectedDate);
                            }}
                            mode="date"
                            display="spinner"
                            themeVariant="dark"
                            style={styles.datePicker}
                        />

                        <View style={styles.modalFooter}>
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <Pressable style={styles.confirmButton} onPress={onConfirm}>
                                <Text style={styles.confirmButtonText}>Log</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    error: {
        color: "#b00020",
        marginRight: 80,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#0f0f0f",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        height: "48%",
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
        justifyContent: "flex-end",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#1f1f1f",
        paddingTop: 12,
        paddingBottom: 30,
    },
    modalFooterText: {
        color: "#9a9a9a",
    },
	input: {
		backgroundColor: "#1e1e1e",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
        marginBottom: 20,
		color: "#ffffff",
	},
    datePicker: {
        marginHorizontal: "auto",
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: "#20ca17",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        width: "25%",
    },
    confirmButtonText: {
        color: "#ffffff",
        fontWeight: "600",
        textAlign:"center"
    },
});

