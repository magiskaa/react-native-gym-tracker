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
import { ModalStyles } from "../styles/ModalStyles";
import { CommonStyles } from "../styles/CommonStyles";

const Item: any = Picker.Item;

type Props = {
    visible: boolean;
    error: string | null;
    startDate: Date;
    endDate: Date | null;
    phase: string;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date | null) => void;
    setPhase: (phase: string) => void;
    setStartingWeight: (weight: number) => void;
    setWeightGoal: (goal: number | null) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function StartPhaseModal({ 
    visible, 
    error,
    startDate,
    endDate,
    phase,
    setStartDate,
    setEndDate, 
    setPhase,
    setStartingWeight,
    setWeightGoal,
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
                <View style={ModalStyles.modalOverlay}>
                    <View style={ModalStyles.modalSheet}>
                        <View style={ModalStyles.modalHeader}>
                            <Text style={ModalStyles.modalTitle}>Start Phase</Text>

                            <Pressable onPress={() => { 
                                setStartDate(new Date());
                                setEndDate(null);
                                setPhase("maintain");
                                setStartingWeight(0);
                                setWeightGoal(null);
                                onClose(); 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}>
                                <Text style={ModalStyles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <Picker
                            selectedValue={phase}
                            onValueChange={(v) => setPhase(v)}
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
                            style={CommonStyles.input}
                        />
                        <TextInput
                            onChangeText={(value) => setWeightGoal(Number(value.replace(",", ".")))}
                            placeholder="Weight goal (optional)"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={CommonStyles.input}
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
                                value={endDate ? endDate : new Date()}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setEndDate(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={ModalStyles.datePicker}
                            />
                        ) : (
                            <DateTimePicker
                                value={startDate}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setStartDate(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={ModalStyles.datePicker}
                            />
                        )}

                        <View style={ModalStyles.modalFooter}>
                            {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                            <Pressable 
                                onPress={() => { 
                                    onConfirm(); 
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                                }}
                                style={({ pressed }) => [
                                    ModalStyles.button,
                                    pressed && CommonStyles.buttonPressed
                                ]}    
                            >
                                <Text style={CommonStyles.buttonText}>Start</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    switch: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        marginBottom: -12,
    },
    switchText: {
        fontSize: 18,
        color: "#f1f1f1",
    },
});

