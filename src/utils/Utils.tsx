export const formatDate = (date: string) => {
    const parts = date.split("-");
    return `${parts[2].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[0]}`
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
