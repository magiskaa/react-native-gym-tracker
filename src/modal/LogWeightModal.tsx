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
import * as Haptics from 'expo-haptics';
import DateTimePicker from "@react-native-community/datetimepicker";
import { ModalStyles } from "../styles/ModalStyles";
import { CommonStyles } from "../styles/CommonStyles";

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
                <View style={ModalStyles.modalOverlay}>
                    <View style={ModalStyles.modalSheet}>
                        <View style={ModalStyles.modalHeader}>
                            <Text style={ModalStyles.modalTitle}>Log weight</Text>

                            <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                <Text style={ModalStyles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <TextInput 
                            value={weightInput}
                            onChangeText={setWeightInput}
                            placeholder="Weight (kg)"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={CommonStyles.input}
                        />

                        <DateTimePicker
                            value={dateInput}
                            onChange={(event, selectedDate) => {
                                if (selectedDate) setDateInput(selectedDate);
                            }}
                            mode="date"
                            display="spinner"
                            themeVariant="dark"
                            style={ModalStyles.datePicker}
                        />

                        <View style={ModalStyles.modalFooter}>
                            {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                            <Pressable style={ModalStyles.button} onPress={() => { onConfirm(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                <Text style={CommonStyles.buttonText}>Log</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
