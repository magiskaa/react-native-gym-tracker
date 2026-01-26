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
