import {
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View,
    FlatList
} from "react-native";
import * as Haptics from 'expo-haptics';
import { ModalStyles } from "../../styles/ModalStyles";
import { CommonStyles } from "../../styles/CommonStyles";
import { capitalize } from "../../utils/Utils";

type Props = {
    visible: boolean;
    error: string | null;
    selectedGroups: Set<string>;
    selectedCount: number;
    onToggleGroup: (name: string) => void;
    onClose: () => void;
};

export default function FilterExercisesModal({ 
    visible,
    error,
    selectedGroups,
    selectedCount,
    onToggleGroup,
    onClose
}: Props) {
    const muscleGroups = ["chest", "shoulders", "biceps", "triceps", "legs", "back", "abs"];
    const muscleGroupColors = new Map([
		["chest", "#9f0fca"],
		["shoulders", "#0c3ed5"],
		["biceps", "#ffd700"],
		["triceps", "#47db16"],
		["legs", "#f00707"],
		["back", "#2f8507"],
		["abs", "#ea0a58"]
	]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={ModalStyles.modalOverlay}>
                <View style={ModalStyles.modalSheet}>
                    <View style={ModalStyles.modalHeader}>
                        <Text style={ModalStyles.modalTitle}>Filter exercises</Text>

                        <Pressable onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}>
                            <Text style={ModalStyles.modalClose}>Close</Text>
                        </Pressable>
                    </View>

                    <View>
                        {muscleGroups.map(group => {
                            const isSelected = selectedGroups.has(group);
                            return (
                                <Pressable 
                                    style={({ pressed }) => [
                                        CommonStyles.componentContainer,
                                        CommonStyles.flexRow,
                                        pressed && CommonStyles.buttonPressed,
                                        isSelected && styles.muscleGroupSelected,
                                        { marginBottom: 8, padding: 12, justifyContent: "flex-start" }
                                    ]} 
                                    key={group}
                                    onPress={() => {
                                        onToggleGroup(group); 
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <View style={[styles.accent, { backgroundColor: muscleGroupColors.get(group) }]} />
                                    <Text style={styles.muscleGroupName}>{capitalize(group)}</Text>

                                    <Text style={styles.exerciseSelected}>
                                        {isSelected ? "Selected" : ""}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>

                    <View style={[ModalStyles.modalFooter, { justifyContent: "space-between" }]}>
                        <Text style={ModalStyles.modalFooterText}>
                            Selected: {selectedCount}
                        </Text>
                        
                        <Pressable 
                            onPress={() => { 
                                onClose(); 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); 
                            }}
                            style={({ pressed }) => [
                                ModalStyles.button,
                                pressed && CommonStyles.buttonPressed
                            ]}
                        >
                            <Text style={CommonStyles.buttonText}>Filter</Text>
                        </Pressable>
                    </View>

                    {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    accent: {
        width: 6,
        height: "90%",
        borderRadius: 6,
        marginRight: 10,
    },
    muscleGroupSelected: {
        borderWidth: 1,
        borderColor: "#20ca17",
    },
    muscleGroupName: {
        color: "#f1f1f1",
        fontWeight: "600",
        fontSize: 16,
        flex: 1
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

