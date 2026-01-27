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

                    <FlatList
                        data={["rinta", "olkapäät", "hauis", "ojentajat", "jalat", "selkä", "vatsat"]}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const isSelected = selectedGroups.has(item);
                            return (
                                <Pressable
                                    onPress={() => { onToggleGroup(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }}
                                    style={({ pressed }) => [
                                        styles.muscleGroupRow,
                                        isSelected && styles.muscleGroupRowSelected,
                                        pressed && styles.muscleGroupRowPressed,
                                    ]}
                                >
                                    <View>
                                        <Text style={styles.muscleGroupName}>{capitalize(item)}</Text>
                                    </View>

                                    <Text style={styles.exerciseSelected}>
                                        {isSelected ? "Selected" : ""}
                                    </Text>
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={CommonStyles.empty}>No muscle groups found</Text>
                        }
                        contentContainerStyle={styles.listContent}
                    />

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
    muscleGroupRow: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#1e1e1e",
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    muscleGroupRowSelected: {
        borderWidth: 1,
        borderColor: "#20ca17",
    },
    muscleGroupRowPressed: {
        opacity: 0.85,
    },
    muscleGroupName: {
        color: "#f1f1f1",
        fontWeight: "600",
        fontSize: 16
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

