import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export type Profile = {
    username: string;
    image: string | null;
};

const profileCollection = collection(db, "profile");

export const getProfile = async (userId: string): Promise<Profile[]> => {
    const q = query(profileCollection, where("userId", "==", userId));
    const snap = await getDocs(q);

    return snap.docs.map((doc) => {
        const data = doc.data();
        return {
            username: String(data.username),
            image: data.image === undefined ? null : String(data.image),
        };
    });
};

export const addProfile = async (userId: string, username: string, image: string | null) => {
    await addDoc(profileCollection, {
        userId,
        username,
        image
    });
};

export const updateProfile = async (userId: string, username: string | null, image: string | null) => {
    const q = query(profileCollection, where("userId", "==", userId));
    const snap = await getDocs(q);
    const docRef = doc(profileCollection, snap.docs[0].id);

    const updates: { username?: string | null; image?: string | null } = {};

    if (username !== null) { updates.username = username };
    if (image !== null) { updates.image = image };

    if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates);
    }
};
