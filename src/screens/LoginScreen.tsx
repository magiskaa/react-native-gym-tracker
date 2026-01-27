import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Switch, Image, Dimensions } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../auth/authContext";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { CommonStyles } from "../styles/CommonStyles";
import { getProfile, addProfile } from "../services/profile";


const loginValidationSchema = yup.object().shape({
    email: yup
        .string()
        .email("Enter a valid email")
        .required("Email is required"),
    password: yup
        .string()
        .min(8, ({ min }) => `Password must be at least ${min} characters`)
        .required("Password is required"),
});

export default function LoginScreen() {
    const { user, loading } = useAuth();
    const [isRegisterActive, setIsRegisterActive] = useState<boolean>(false);

    const submit = async (values: { email: string; password: string }) => {
        try {
            if (isRegisterActive) {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const uid = userCredential.user.uid;
                const existing = await getProfile(uid);
                if (existing.length === 0) {
                    await addProfile(uid, values.email, null);
                }
            } else {
                await signInWithEmailAndPassword(auth, values.email, values.password);
            }

            if (!auth.currentUser) {
                Alert.alert("Login or Register Failed", "Unable to load user.");
                return;
            }
        } catch (error) {
            Alert.alert("Login or Register Failed", "Please try again.");
            console.log(error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[CommonStyles.container, { justifyContent: "center", backgroundColor: "#1e1e1e" }]}>
                <View style={styles.switchContainer}>
                    <Switch
                        value={isRegisterActive} 
                        onValueChange={(value) => { setIsRegisterActive(value); }}
                    />
                </View>

                <Image source={require('../assets/icon.png')} style={styles.image}/>

                <Text style={styles.title}>{isRegisterActive ? "Register" : "Login"}</Text>
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{ email: "", password: "" }}
                    onSubmit={submit}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        isValid,
                    }) => (
                    <>
                        <View style={styles.inputContainer}>
                            <Feather name="mail" size={24} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#8b8b8b"
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                value={values.email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                autoComplete="email"
                            />
                        </View>
                        {errors.email && touched.email && (
                            <Text style={[CommonStyles.error, { marginTop: -12, marginBottom: 14 }]}>{errors.email}</Text>
                        )}
                        <View style={styles.inputContainer}>
                            <Feather name="lock" size={24} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#8b8b8b"
                                secureTextEntry
                                onChangeText={handleChange("password")}
                                onBlur={handleBlur("password")}
                                value={values.password}
                            />
                        </View>
                        {errors.password && touched.password && (
                            <Text style={[CommonStyles.error, { marginTop: -12, marginBottom: 14 }]}>{errors.password}</Text>
                        )}
                        <TouchableOpacity
                            style={[CommonStyles.button, { margin: 0 }]}
                            onPress={handleSubmit as any}
                            disabled={!isValid}
                        >
                            <Text style={CommonStyles.buttonText}>{isRegisterActive ? "Register" : "Login"}</Text>
                        </TouchableOpacity>
                    </>
                    )}
                </Formik>
            </View>
        </TouchableWithoutFeedback>
    );
}

const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
    switchContainer: {
        position: "absolute",
        bottom: "30%",
        right: "6%"
    },
	image: {
        position: "absolute",
        top: 80,
        left: width / 2 - 85,
		width: 170,
		height: 170,
		borderRadius: 30,
		margin: "auto",
		marginTop: 30,
		marginBottom: 20,
	},
    title: {
        fontSize: 32,
        marginBottom: 30,
        fontWeight: "700",
        color: "#f1f1f1",
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#e3e3e3",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        width: "90%",
        color: "#1e1e1e",
        backgroundColor: "#e3e3e3",
    },
});
