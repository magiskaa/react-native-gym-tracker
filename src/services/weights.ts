import { collection, getDocs, query, where, orderBy, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export type WeightHistory = {
	date: string;
	weight: number;
};

const weightsCollection = collection(db, "weights");

export const getWeight = async (userId: string): Promise<WeightHistory[]> => {
	const q = query(weightsCollection, where("userId", "==", userId), orderBy("date", "asc"));
	const snap = await getDocs(q);
	return snap.docs.map((doc) => {
		const data = doc.data();
		return {
			date: String(data.date),
			weight: Number(data.weight),
		};
	});
};

export const addWeight = async (userId: string, weight: number, date: string) => {
	await addDoc(weightsCollection, {
		userId,
		weight,
		date,
	});
};
