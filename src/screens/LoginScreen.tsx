import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Switch } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../auth/authContext";
import { addProfile, getProfile } from "../services/database";
import { StatusBar } from 'expo-status-bar';


const loginValidationSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required"),
  password: yup
    .string()
    .min(6, ({ min }) => `Password must be at least ${min} characters`)
    .required("Password is required"),
});

export default function LoginScreen() {
    const { saveToken, saveUser } = useAuth();

    const [isRegisterActive, setIsRegisterActive] = useState<boolean>(false);
    

    const submit = async (values: { username: string; password: string }) => {
        try {
            const existingProfiles = await getProfile(values.username);
            let profile = existingProfiles[0];

            if (isRegisterActive) {
                if (existingProfiles.length > 0) {
                    Alert.alert("Register Failed", "Username is already in use.");
                    return;
                }

                await addProfile(values.username, null);
                const createdProfiles = await getProfile(values.username);
                profile = createdProfiles[0];
            } else {
                if (!profile) {
                    Alert.alert("Login Failed", "Please register first.");
                    return;
                }
            }
            if (!profile) {
                Alert.alert("Login or Register Failed", "Unable to load profile.");
                return;
            }
            const token = `profile-${profile.id}`;
            await saveToken(token);
            await saveUser({
                id: profile.id,
                username: profile.username,
                image: profile.image ?? null,
            });
        } catch (error) {
            Alert.alert("Login or Register Failed", "Please try again.");
            console.log(error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar style="auto" />
                <View style={styles.switchContainer}>
                    <Switch
                        value={isRegisterActive} 
                        onValueChange={(value) => { setIsRegisterActive(value); }}
                    />
                </View>

                <Text style={styles.title}>{isRegisterActive ? "Register" : "Login"}</Text>
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{ username: "", password: "" }}
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
                            <Feather name="user" size={24} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#8b8b8b"
                                onChangeText={handleChange("username")}
                                onBlur={handleBlur("username")}
                                value={values.username}
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.username && touched.username && (
                        <Text style={styles.errorText}>{errors.username}</Text>
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
                        <Text style={styles.errorText}>{errors.password}</Text>
                        )}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit as any}
                            disabled={!isValid}
                        >
                            <Text style={styles.buttonText}>{isRegisterActive ? "Register" : "Login"}</Text>
                        </TouchableOpacity>
                    </>
                    )}
                </Formik>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fcfcfc",
        paddingHorizontal: 20,
    },
    switchContainer: {
        position: "absolute",
        bottom: "30%",
        right: "6%"
    },
    title: {
        fontSize: 32,
        marginBottom: 40,
        fontWeight: "bold",
        color: "black",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        height: 50,
        backgroundColor: "#f1f1f1",
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
        backgroundColor: "#f1f1f1",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 20,
        color: "#000",
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#20ca17",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
    },
    signUp: {
        color: "#000",
    },
    signUpLink: {
        color: "#1E90FF",
    },
    errorText: {
        color: "red",
        alignSelf: "flex-start",
        marginBottom: 10,
    },
});
