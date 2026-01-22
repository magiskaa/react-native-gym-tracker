import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { ExerciseRow } from "../services/database";

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
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select exercises</Text>

                        <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}}>
                            <Text style={styles.modalClose}>Close</Text>
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
                            <Text style={styles.empty}>No exercises found</Text>
                        }
                        contentContainerStyle={styles.exerciseList}
                    />

                    <View style={styles.modalFooter}>
                        <Text style={styles.modalFooterText}>
                            Selected: {selectedCount}
                        </Text>

                        <Pressable style={styles.confirmButton} onPress={() => { onConfirm(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}}>
                            <Text style={styles.confirmButtonText}>Use selection</Text>
                        </Pressable>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    error: {
        color: "#b00020",
        marginBottom: 8,
        textAlign: "center",
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
        height: "70%",
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
    exerciseList: {
        paddingBottom: 16,
    },
    exerciseRow: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#1a1a1a",
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
        color: "#ffffff",
        fontWeight: "600",
    },
    muscleGroup: {
        color: "#9a9a9a",
        fontSize: 12,
    },
    exerciseSelected: {
        color: "#20ca17",
        fontSize: 12,
        fontWeight: "600",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#1f1f1f",
        paddingTop: 12,
        paddingBottom: 30,
    },
    modalFooterText: {
        color: "#9a9a9a",
    },
    confirmButton: {
        backgroundColor: "#20ca17",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    confirmButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    empty: {
        color: "#9a9a9a",
        textAlign: "center",
        marginTop: 12,
    },
});