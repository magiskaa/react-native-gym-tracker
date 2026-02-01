import { View, Text, StyleSheet } from 'react-native';
import Toast from "react-native-toast-message";
import Feather from '@expo/vector-icons/Feather';

const styles = StyleSheet.create({
    baseContainer: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    successContainer: {
        backgroundColor: '#20ca17',
    },
    errorContainer: {
        backgroundColor: '#b00020',
    },
    title: {
        color: '#f1f1f1',
        fontSize: 18,
        fontWeight: '700',
    },
    message: {
        color: '#f1f1f1',
        fontSize: 14,
        marginTop: 4,
    },
});

export const toastConfig = {
    success: ({ text1, text2 }: any) => (
        <View style={[styles.successContainer, styles.baseContainer]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Feather name="check" size={24} color="#f1f1f1" />
                <View>
                    <Text style={styles.title}>{text1}</Text>
                    {text2 ? <Text style={styles.message}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),
    error: ({ text1, text2 }: any) => (
        <View style={[styles.errorContainer, styles.baseContainer]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Feather name="x-octagon" size={24} color="#f1f1f1" />
                <View>
                    <Text style={styles.title}>{text1}</Text>
                    {text2 ? <Text style={styles.message}>{text2}</Text> : null}
                </View>
            </View>
        </View>
    ),
};

export const useToast = (type: string, text1: string, text2: string, time: number = 6000) => {
    Toast.show({
        type,
        text1,
        text2,
        position: "top",
        visibilityTime: time,
        autoHide: true,
        topOffset: 80,
    });
};
