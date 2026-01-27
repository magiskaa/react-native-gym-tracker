import { 
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    Keyboard, 
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import DateTimePicker from "@react-native-community/datetimepicker";
import { CommonStyles } from "../../styles/CommonStyles";
import { ModalStyles } from "../../styles/ModalStyles";

type Props = {
    visible: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: (calGoal: number, protGoal: number) => void;
};

export default function SetNutritionGoalsModal({ 
    visible, 
    error,
    onClose,
    onConfirm
}: Props) {
    const [calorieGoal, setCalorieGoal] = useState<number>(0);
    const [proteinGoal, setProteinGoal] = useState<number>(0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={ModalStyles.modalOverlay}>
                        <View style={ModalStyles.modalSheet}>
                            <View style={ModalStyles.modalHeader}>
                                <Text style={ModalStyles.modalTitle}>Set Nutrition Goals</Text>

                                <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                                    <Text style={ModalStyles.modalClose}>Close</Text>
                                </Pressable>
                            </View>

                            <TextInput 
                                onChangeText={(value) => setCalorieGoal(Number(value))}
                                placeholder="Calorie Goal"
                                placeholderTextColor="#8b8b8b"
                                keyboardType="number-pad"
                                style={CommonStyles.input}
                            />
                            <TextInput 
                                onChangeText={(value) => setProteinGoal(Number(value))}
                                placeholder="Protein Goal"
                                placeholderTextColor="#8b8b8b"
                                keyboardType="number-pad"
                                style={CommonStyles.input}
                            />

                            <View style={ModalStyles.modalFooter}>
                                {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                                <Pressable 
                                    onPress={() => { 
                                        onConfirm(calorieGoal, proteinGoal);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                                    }}
                                    style={({ pressed }) => [
                                        ModalStyles.button,
                                        pressed && CommonStyles.buttonPressed
                                    ]}    
                                >
                                    <Text style={CommonStyles.buttonText}>Set</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
});
