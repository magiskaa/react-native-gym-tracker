import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { ExerciseRow } from "../services/database";
import { ModalStyles } from "../styles/ModalStyles";
import { CommonStyles } from "../styles/CommonStyles";

type Props = {
    visible: boolean;
    exercises: ExerciseRow[];
    selectedIds: Set<number>;
    selectedCount: number;
    error: string | null;
    onToggleExercise: (id: number) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ExerciseSelectModal({
    visible,
    exercises,
    selectedIds,
    selectedCount,
    error,
    onToggleExercise,
    onClose,
    onConfirm,
}: Props) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={ModalStyles.modalOverlay}>
                <View style={[ModalStyles.modalSheet, { height: "73%" }]}>
                    <View style={ModalStyles.modalHeader}>
                        <Text style={ModalStyles.modalTitle}>Select exercises</Text>

                        <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}}>
                            <Text style={ModalStyles.modalClose}>Close</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            const isSelected = selectedIds.has(item.id);
                            return (
                                <Pressable
                                    onPress={() => { onToggleExercise(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                                    style={({ pressed }) => [
                                        styles.exerciseRow,
                                        isSelected && styles.exerciseRowSelected,
                                        pressed && styles.exerciseRowPressed,
                                    ]}
                                >
                                    <View>
                                        <Text style={styles.exerciseName}>{item.name}</Text>
                                        <Text style={styles.muscleGroup}>{item.muscle_group}</Text>
                                    </View>

                                    <Text style={styles.exerciseSelected}>
                                        {isSelected ? "Selected" : ""}
                                    </Text>
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={CommonStyles.empty}>No exercises found</Text>
                        }
                        contentContainerStyle={styles.listContent}
                    />

                    <View style={[ModalStyles.modalFooter, { justifyContent: "space-between" }]}>
                        <Text style={ModalStyles.modalFooterText}>
                            Selected: {selectedCount}
                        </Text>

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
                            <Text style={CommonStyles.buttonText}>Use selection</Text>
                        </Pressable>
                    </View>

                    {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    exerciseRow: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#1e1e1e",
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    exerciseRowSelected: {
        borderWidth: 1,
        borderColor: "#20ca17",
    },
    exerciseRowPressed: {
        opacity: 0.85,
    },
    exerciseName: {
        color: "#f1f1f1",
        fontWeight: "600",
    },
    muscleGroup: {
        color: "#767676",
        fontSize: 12,
    },
    exerciseSelected: {
        color: "#20ca17",
        fontSize: 12,
        fontWeight: "600",
    },
    listContent: {
        paddingBottom: 16,
    },
});