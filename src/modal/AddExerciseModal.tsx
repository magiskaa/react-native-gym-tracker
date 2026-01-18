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
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalSheet}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add exercise</Text>

                                <Pressable onPress={onClose}>
                                    <Text style={styles.modalClose}>Close</Text>
                                </Pressable>
                            </View>

                            <View style={styles.form}>
                                <TextInput
                                    value={exerciseName}
                                    onChangeText={setExerciseName}
                                    placeholder="Exercise name"
                                    placeholderTextColor="#8b8b8b"
                                    style={styles.input}
                                />
                                <TextInput
                                    value={muscleGroup}
                                    onChangeText={setMuscleGroup}
                                    placeholder="Muscle group"
                                    placeholderTextColor="#8b8b8b"
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.modalFooter}>
                                {error ? <Text style={styles.error}>{error}</Text> : null}
                                <Pressable style={styles.confirmButton} onPress={onConfirm}>
                                    <Text style={styles.confirmButtonText}>Add</Text>
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
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        justifyContent: "flex-end",
    },
    error: {
        color: "#b00020",
        marginRight: 30,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#0f0f0f",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        height: "27%",
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
	form: {
		gap: 10,
		marginBottom: 12,
	},
	input: {
		backgroundColor: "#1e1e1e",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: "#ffffff",
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
