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
import { Picker } from '@react-native-picker/picker';

const Item: any = Picker.Item;

type Props = {
    visible: boolean;
    error: string | null;
    startDateInput: Date;
    endDateInput: Date | null;
    phaseInput: string;
    setStartDateInput: (date: Date) => void;
    setEndDateInput: (date: Date | null) => void;
    setPhaseInput: (phase: string) => void;
    setStartingWeight: (weight: number) => void;
    setWeightGoalInput: (goal: number | null) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function StartPhaseModal({ 
    visible, 
    error,
    startDateInput,
    endDateInput,
    phaseInput,
    setStartDateInput,
    setEndDateInput, 
    setPhaseInput,
    setStartingWeight,
    setWeightGoalInput,
    onClose,
    onConfirm
}: Props) {
    const [isEndDateActive, setIsEndDateActive] = useState<boolean>(false);

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
                            <Text style={styles.modalTitle}>Start Phase</Text>

                            <Pressable onPress={() => { 
                                setStartDateInput(new Date());
                                setEndDateInput(null);
                                setPhaseInput("maintain");
                                setStartingWeight(0);
                                setWeightGoalInput(null);
                                onClose(); 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}>
                                <Text style={styles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <Picker
                            selectedValue={phaseInput}
                            onValueChange={(v) => setPhaseInput(v)}
                            style={{marginBottom: -12, marginTop: -32}}
                        >
                            <Item label="Bulk" value="bulk" />
                            <Item label="Maintain" value="maintain" />
                            <Item label="Cut" value="cut" />
                        </Picker>
                        
                        <TextInput 
                            onChangeText={(value) => setStartingWeight(Number(value.replace(",", ".")))}
                            placeholder="Starting weight"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput 
                            onChangeText={(value) => setWeightGoalInput(Number(value.replace(",", ".")))}
                            placeholder="Weight goal (optional)"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <View style={styles.switch}>
                            <Text style={styles.switchText}>{isEndDateActive ? "End date (optional)" : "Start date"}</Text>
                            <Switch 
                                value={isEndDateActive} 
                                onValueChange={(value) => { setIsEndDateActive(value); }}
                            />
                        </View>

                        {isEndDateActive ? (
                            <DateTimePicker
                                value={endDateInput ? endDateInput : new Date()}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setEndDateInput(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={styles.datePicker}
                            />
                        ) : (
                            <DateTimePicker
                                value={startDateInput}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setStartDateInput(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={styles.datePicker}
                            />
                        )}

                        <View style={styles.modalFooter}>
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <Pressable style={styles.confirmButton} onPress={() => { onConfirm(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                <Text style={styles.confirmButtonText}>Start</Text>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        marginBottom: -12,
    },
    switchText: {
        fontSize: 18,
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

