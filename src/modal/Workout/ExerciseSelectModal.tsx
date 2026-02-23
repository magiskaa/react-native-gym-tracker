import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { Exercise } from "../../services/exercises"; 
import { ModalStyles } from "../../styles/ModalStyles";
import { CommonStyles } from "../../styles/CommonStyles";
import { useEffect, useState, useMemo } from "react";

type Props = {
    visible: boolean;
    exercises: Exercise[] | null;
    isLoading?: boolean;
    isWorkoutActive: boolean;
    selectedIds: Set<number>;
    selectedCount: number;
    error: string | null;
    setSelectedIds: (ids: Set<number>) => void;
    onToggleExercise: (id: number) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function ExerciseSelectModal({
    visible,
    exercises,
    isLoading = false,
    isWorkoutActive,
    selectedIds,
    selectedCount,
    error,
    setSelectedIds,
    onToggleExercise,
    onClose,
    onConfirm,
}: Props) {
    const [modifiedSelectedIds, setModifiedSelectedIds] = useState<Set<number>>(selectedIds);
    const modifiedSelectedCount = useMemo(() => modifiedSelectedIds.size, [modifiedSelectedIds]);
    
    const muscleGroupColors = new Map([
		["Chest", "#9f0fca"],
		["Shoulders", "#0c3ed5"],
		["Biceps", "#ffd700"],
		["Triceps", "#47db16"],
		["Legs", "#f00707"],
		["Back", "#2f8507"],
		["Abs", "#ea0a58"]
	]);

    const toggleModifiedExercise = (id: number) => {
		setModifiedSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

    useEffect(() => {
        if (isWorkoutActive) {
            setModifiedSelectedIds(selectedIds);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={ModalStyles.modalOverlay}>
                <View style={[ModalStyles.modalSheet, { height: "70%" }]}>
                    <View style={ModalStyles.modalHeader}>
                        <Text style={ModalStyles.modalTitle}>Select exercises</Text>

                        <Pressable onPress={() => {
                            setModifiedSelectedIds(new Set());
                            onClose();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}>
                            <Text style={ModalStyles.modalClose}>Close</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            let isSelected = selectedIds.has(item.id);
                            if (isWorkoutActive) { isSelected = modifiedSelectedIds.has(item.id); }

                            return (
                                <Pressable
                                    onPress={() => {
                                        if (isWorkoutActive) { toggleModifiedExercise(item.id); }
                                        else { onToggleExercise(item.id); }
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                                    }}
                                    style={({ pressed }) => [
                                        CommonStyles.componentContainer,
                                        styles.exercise,
                                        isSelected && styles.exerciseSelected,
                                        pressed && CommonStyles.buttonPressed,
                                    ]}
                                >
                                    <View style={[styles.accent, { backgroundColor: muscleGroupColors.get(item.muscleGroup) }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.exerciseName}>{item.name}</Text>
                                        <Text style={styles.muscleGroup}>{item.muscleGroup}</Text>
                                    </View>

                                    <Text style={styles.exerciseSelectedText}>
                                        {isSelected ? "Selected" : ""}
                                    </Text>
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            isLoading ? (
                                <ActivityIndicator size="small" color="#20ca17" />
                            ) : (
                                <Text style={CommonStyles.empty}>No exercises found</Text>
                            )
                        }
                        contentContainerStyle={styles.listContent}
                    />

                    <View style={[ModalStyles.modalFooter, { justifyContent: "space-between" }]}>
                        <Text style={ModalStyles.modalFooterText}>
                            Selected: {isWorkoutActive ? modifiedSelectedCount : selectedCount}
                        </Text>

                        <Pressable 
                            onPress={() => {
                                if (isWorkoutActive) { setSelectedIds(modifiedSelectedIds); }
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
    exercise: {
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    exerciseSelected: {
        borderWidth: 1,
        borderColor: "#20ca17",
    },
    accent: {
        width: 6,
        height: "90%",
        borderRadius: 6,
        marginRight: 10,
    },
    exerciseName: {
        color: "#f1f1f1",
        fontWeight: "600",
        fontSize: 18,
        marginBottom: 2, 
    },
    muscleGroup: {
        color: "#767676",
        fontSize: 14,
    },
    exerciseSelectedText: {
        color: "#20ca17",
        fontSize: 12,
        fontWeight: "600",
    },
    listContent: {
        paddingBottom: 16,
    },
});