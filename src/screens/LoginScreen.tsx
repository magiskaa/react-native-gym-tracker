import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Switch, Image, Dimensions } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../auth/authContext";
import { addProfile, getProfile } from "../services/database";
import { CommonStyles } from "../styles/CommonStyles";


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
                        <Text style={CommonStyles.error}>{errors.username}</Text>
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
                        <Text style={CommonStyles.error}>{errors.password}</Text>
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
