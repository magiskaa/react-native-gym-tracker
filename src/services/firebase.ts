import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);