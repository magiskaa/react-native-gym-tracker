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
import { CommonStyles } from "../../styles/CommonStyles";
import { ModalStyles } from "../../styles/ModalStyles";

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
                            <Text style={ModalStyles.modalTitle}>Log Calories</Text>

                            <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                <Text style={ModalStyles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <TextInput 
                            onChangeText={(value) => setCalories(Number(value))}
                            placeholder="Calories"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="number-pad"
                            style={CommonStyles.input}
                        />
                        <TextInput 
                            onChangeText={(value) => setProtein(Number(value))}
                            placeholder="Protein"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="number-pad"
                            style={CommonStyles.input}
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
                            style={[ModalStyles.datePicker, { marginTop: 22 }]}
                        />

                        <View style={ModalStyles.modalFooter}>
                            {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                            <Pressable 
                                onPress={() => { 
                                    onConfirm(calories, protein); 
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                                }}
                                style={({ pressed }) => [
                                    ModalStyles.button,
                                    pressed && CommonStyles.buttonPressed
                                ]}    
                            >
                                <Text style={CommonStyles.buttonText}>Log</Text>
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
        position: "absolute",
        top: 170,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    switchText: {
        color: "#767676",
        marginRight: 8,
    },
});

