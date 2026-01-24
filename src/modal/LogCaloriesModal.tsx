import { 
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    Keyboard, 
    TouchableWithoutFeedback,
    Switch
} from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
    visible: boolean;
    error: string | null;
    dateInput: Date;
    isRemoveActive: boolean;
    setDateInput: (date: Date) => void;
    setIsRemoveActive: (active: boolean) => void;
    onClose: () => void;
    onConfirm: (calories: number, protein: number) => void;
};

export default function LogCaloriesModal({ 
    visible, 
    error,
    dateInput,
    isRemoveActive,
    setDateInput, 
    setIsRemoveActive,
    onClose,
    onConfirm
}: Props) {
    const [calories, setCalories] = useState<number>(0);
    const [protein, setProtein] = useState<number>(0);

    const handleOnConfirm = () => {
        onConfirm(calories, protein);
    };

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
                            <Text style={styles.modalTitle}>Log Calories</Text>

                            <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                <Text style={styles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <TextInput 
                            onChangeText={(value) => setCalories(Number(value))}
                            placeholder="Calories"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="number-pad"
                            style={styles.input}
                        />
                        <TextInput 
                            onChangeText={(value) => setProtein(Number(value))}
                            placeholder="Protein"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="number-pad"
                            style={styles.input}
                        />

                        <View style={styles.switch}>
                            <Text style={styles.switchText}>Remove</Text>
                            <Switch 
                                value={isRemoveActive} 
                                onValueChange={(value) => { setIsRemoveActive(value); }}
                            />
                        </View>

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
                            <Pressable style={styles.confirmButton} onPress={() => { handleOnConfirm(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
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
        padding: 8,
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
    switch: {
        position: "absolute",
        top: 165,
        right: 16,
        flexDirection: "row",
        alignItems: "center"
    },
    switchText: {
        color: "#c7c7c7",
        marginRight: 8,
    },
    datePicker: {
        marginHorizontal: "auto",
        marginTop: 16,
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

