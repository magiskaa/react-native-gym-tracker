import {
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableWithoutFeedback, 
    Keyboard,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import * as Haptics from 'expo-haptics';
import { ModalStyles } from "../styles/ModalStyles";
import { CommonStyles } from "../styles/CommonStyles";

type Props = {
    visible: boolean;
    error: string | null;
    exerciseName: string;
    muscleGroup: string;
    setExerciseName: (name: string) => void;
    setMuscleGroup: (muscle_group: string) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function AddExerciseModal({ 
    visible,
    error,
    exerciseName,
    muscleGroup,
    setExerciseName,
    setMuscleGroup,
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={ModalStyles.modalOverlay}>
                        <View style={ModalStyles.modalSheet}>
                            <View style={ModalStyles.modalHeader}>
                                <Text style={ModalStyles.modalTitle}>Add exercise</Text>

                                <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}}>
                                    <Text style={ModalStyles.modalClose}>Close</Text>
                                </Pressable>
                            </View>

                            <View style={styles.form}>
                                <TextInput
                                    value={exerciseName}
                                    onChangeText={setExerciseName}
                                    placeholder="Exercise name"
                                    placeholderTextColor="#8b8b8b"
                                    style={[CommonStyles.input, { marginBottom: 8 }]}
                                />
                                <TextInput
                                    value={muscleGroup}
                                    onChangeText={setMuscleGroup}
                                    placeholder="Muscle group"
                                    placeholderTextColor="#8b8b8b"
                                    style={[CommonStyles.input, { marginBottom: 12 }]}
                                />
                            </View>

                            <View style={ModalStyles.modalFooter}>
                                {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                                <Pressable style={ModalStyles.button} onPress={() => { onConfirm(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}}>
                                    <Text style={CommonStyles.buttonText}>Add</Text>
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
	form: {
		gap: 10,
		marginBottom: 12,
	},
});
