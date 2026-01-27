import { initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence exists in the RN bundle 
// but is often missing from public TypeScript definitions.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBWjw5aQMNRSv9ToT3CnIJ9w6EMPu9JwHg",
    authDomain: "react-native-gym-tracker.firebaseapp.com",
    projectId: "react-native-gym-tracker",
    storageBucket: "react-native-gym-tracker.firebasestorage.app",
    messagingSenderId: "753306043088",
    appId: "1:753306043088:web:11f8b45cdc45d69b4754d5",
    measurementId: "G-X464ZBYZ1K"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);