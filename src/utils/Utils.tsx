import * as Crypto from "expo-crypto";

export const formatDate = (date: string) => {
    const parts = date.split("-");
    return `${parts[2].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[0]}`
};

export const formatDateWOZeros = (date: string) => {
    const parts = date.split("-");
    return `${parseInt(parts[2])}.${parseInt(parts[1])}.`
};

export const formatLocalDateISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const formatDuration = (elapsed: number) => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor(elapsed / 60);
    const s = Math.round(elapsed - h*3600 - m*60);
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const capitalize = (word: string) => {
    const firstLetter = word.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = word.slice(1);
    return firstLetterCap + remainingLetters;
};

export const dayDiff = (startDate: Date, endDate: Date) => {
    const msDiff = endDate.getTime() - startDate.getTime();
    return Math.round(msDiff / (1000 * 3600 * 24));
};

export const hashPassword = async (password: string, salt: string) => {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${salt}:${password}`
    );
};

export const createPasswordHash = async (password: string) => {
    const salt = Crypto.randomUUID();
    const hash = await hashPassword(password, salt);
    return { salt, hash };
};

export const verifyPassword = async (
    password: string,
    salt: string,
    expectedHash: string
) => {
    const hash = await hashPassword(password, salt);
    return hash === expectedHash;
};

export const epleyCalc = (weight: number, reps: number) => {
    return (0.033 * reps * weight) + weight;
};
