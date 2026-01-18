import {
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View,
    FlatList
} from "react-native";

type Props = {
    visible: boolean;
    error: string | null;
    selectedGroups: Set<string>;
    selectedCount: number;
    onToggleGroup: (name: string) => void;
    onClose: () => void;
    onConfirm: () => void;
};

export default function FilterExercisesModal({ 
    visible,
    error,
    selectedGroups,
    selectedCount,
    onToggleGroup,
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter exercises</Text>

                        <Pressable onPress={onClose}>
                            <Text style={styles.modalClose}>Close</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={["rinta", "olkapäät", "hauis", "ojentajat", "jalat", "selkä", "vatsat"]}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const isSelected = selectedGroups.has(item);
                            return (
                                <Pressable
                                    onPress={() => onToggleGroup(item)}
                                    style={({ pressed }) => [
                                        styles.exerciseRow,
                                        isSelected && styles.exerciseRowSelected,
                                        pressed && styles.exerciseRowPressed,
                                    ]}
                                >
                                    <View>
                                        <Text style={styles.exerciseName}>{item}</Text>
                                    </View>

                                    <Text style={styles.exerciseSelected}>
                                        {isSelected ? "Selected" : ""}
                                    </Text>
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            <Text style={styles.empty}>No muscle groups found</Text>
                        }
                        contentContainerStyle={styles.exerciseList}
                    />

                    <View style={styles.modalFooter}>
                        <Text style={styles.modalFooterText}>
                            Selected: {selectedCount}
                        </Text>
                        
                        <Pressable style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>Filter</Text>
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
        marginRight: 30,
        textAlign: "center"
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
        height: "58%",
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
        fontSize: 16
    },
    exerciseSelected: {
        color: "#20ca17",
        fontSize: 12,
        fontWeight: "600",
    },
    empty: {
        color: "#9a9a9a",
        textAlign: "center",
        marginTop: 12,
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

