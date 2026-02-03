import { 
    Modal, 
    Pressable, 
    StyleSheet, 
    Text, 
    View, 
    TextInput,
    Keyboard, 
    TouchableWithoutFeedback,
    Switch
} from "react-native";
import { useState } from "react";
import * as Haptics from 'expo-haptics';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';
import { ModalStyles } from "../../styles/ModalStyles";
import { CommonStyles } from "../../styles/CommonStyles";

const Item: any = Picker.Item;

type Props = {
    visible: boolean;
    error: string | null;
    oldStartDate: Date;
    oldEndDate: Date | null;
    oldType: string;
    onClose: () => void;
    onConfirm: (
        type: string | null,
        startDate: Date | null, 
        endDate: Date | null , 
        startingWeight: number | null, 
        weightGoal: number | null
    ) => void;
};

export default function UpdatePhaseModal({ 
    visible, 
    error,
    oldStartDate,
    oldEndDate,
    oldType,
    onClose,
    onConfirm
}: Props) {
    const [isEndDateActive, setIsEndDateActive] = useState<boolean>(false);

    const [type, setType] = useState<string>(oldType);
	const [startDate, setStartDate] = useState<Date>(new Date(oldStartDate));
	const [endDate, setEndDate] = useState<Date | null>(oldEndDate);
	const [startingWeight, setStartingWeight] = useState<number | null>(null);
	const [weightGoal, setWeightGoal] = useState<number | null>(null);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={ModalStyles.modalOverlay}>
                    <View style={ModalStyles.modalSheet}>
                        <View style={ModalStyles.modalHeader}>
                            <Text style={ModalStyles.modalTitle}>Update Phase</Text>

                            <Pressable onPress={() => {
                                setType("maintain");
                                setStartDate(new Date());
                                setEndDate(null);
                                setStartingWeight(0);
                                setWeightGoal(null);
                                onClose(); 
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}>
                                <Text style={ModalStyles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <Picker
                            selectedValue={type}
                            onValueChange={(value) => setType(value)}
                            style={{marginBottom: -12, marginTop: -32}}
                        >
                            <Item label="Bulk" value="bulk" />
                            <Item label="Maintain" value="maintain" />
                            <Item label="Cut" value="cut" />
                        </Picker>
                        
                        <TextInput
                            onChangeText={(value) => setStartingWeight(Number(value.replace(",", ".")))}
                            placeholder="Starting weight"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={CommonStyles.input}
                        />
                        <TextInput
                            onChangeText={(value) => setWeightGoal(Number(value.replace(",", ".")))}
                            placeholder="Weight goal (optional)"
                            placeholderTextColor="#8b8b8b"
                            keyboardType="numeric"
                            style={CommonStyles.input}
                        />

                        <View style={styles.switch}>
                            <Text style={styles.switchText}>{isEndDateActive ? "End date (optional)" : "Start date"}</Text>
                            <Switch 
                                value={isEndDateActive} 
                                onValueChange={(value) => { setIsEndDateActive(value); }}
                            />
                        </View>

                        {isEndDateActive ? (
                            <DateTimePicker
                                value={endDate ? endDate : new Date()}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setEndDate(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={ModalStyles.datePicker}
                            />
                        ) : (
                            <DateTimePicker
                                value={startDate}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) setStartDate(selectedDate);
                                }}
                                mode="date"
                                display="spinner"
                                themeVariant="dark"
                                style={ModalStyles.datePicker}
                            />
                        )}

                        <View style={ModalStyles.modalFooter}>
                            {error ? <Text style={ModalStyles.error}>{error}</Text> : null}
                            <Pressable 
                                onPress={() => { 
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    onConfirm(type, startDate, endDate, startingWeight, weightGoal);
                                }}
                                style={({ pressed }) => [
                                    ModalStyles.button,
                                    pressed && CommonStyles.buttonPressed
                                ]}    
                            >
                                <Text style={CommonStyles.buttonText}>Update</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    switch: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        marginBottom: -12,
    },
    switchText: {
        fontSize: 18,
        color: "#f1f1f1",
    },
});

