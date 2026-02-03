import { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    TouchableWithoutFeedback, 
    Keyboard, 
    Switch, 
    Image, 
    Dimensions, 
    AppState 
} from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Formik } from "formik";
import * as yup from "yup";
import { CommonStyles } from "../styles/CommonStyles";
import { supabase } from "../services/supabase";
import { getProfile, addProfile } from "../services/profiles";
import { addNutritionGoals } from "../services/nutritionGoals";


AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

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
    const [isRegisterActive, setIsRegisterActive] = useState<boolean>(false);

    const submit = async (values: { email: string; password: string }) => {
        try {
            if (isRegisterActive) {
                const { error } = await supabase.auth.signUp({
                    email: values.email, 
                    password: values.password
                });
                if (error) {
                    Alert.alert("signUp", error.message);
                    return;
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: values.email, 
                    password: values.password
                });
                if (error) {
                    Alert.alert("signIn", error.message);
                    return;
                }
            }

            const { data: userData, error: userErr } = await supabase.auth.getUser();
            if (userErr) {
                Alert.alert("Auth user", userErr.message);
                return;
            }
            const userId = userData?.user?.id;
            const profileData = await getProfile(userId);
            if (!profileData) {
                await addProfile(userId, values.email);
                await addNutritionGoals(userId);
            }

        } catch (error) {
            Alert.alert("Login or Register Failed", "Please try again");
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
