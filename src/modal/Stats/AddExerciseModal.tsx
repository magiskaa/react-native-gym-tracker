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
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { ModalStyles } from "../../styles/ModalStyles";
import { CommonStyles } from "../../styles/CommonStyles";
import { capitalize } from "../../utils/Utils";

const Item: any = Picker.Item;

type Props = {
    visible: boolean;
    error: string | null;
    exerciseName: string;
    muscleGroup: string;
    allowedGroups: string[];
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
    allowedGroups,
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

                            <TextInput
                                value={exerciseName}
                                onChangeText={setExerciseName}
                                placeholder="Exercise name"
                                placeholderTextColor="#8b8b8b"
                                style={[CommonStyles.input]}
                            />

                            <Picker
                                selectedValue={muscleGroup}
                                onValueChange={(value) => setMuscleGroup(value)}
                                style={{marginBottom: -6, marginTop: -22}}
                            >
                                {allowedGroups.map((group) => (
                                    <Item label={capitalize(group)} value={group} />
                                ))}
                            </Picker>

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
    },
});
