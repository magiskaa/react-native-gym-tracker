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

export const calculateOneRepMax = (weight: number, reps: number) => {
    // Epley formula
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
};

export const calculateStrengthScoreBWRatio = (oneRepMax: number, bodyWeight: number, eliteBWRatio: number, isFemaleIndex: boolean) => {
    if (!bodyWeight || bodyWeight === 0) return { score: 0, scaledElite: 0 };

    const BWRatio = isFemaleIndex ? eliteBWRatio * 0.7 : eliteBWRatio;
    const minBw = 50;
    const maxBw = 140;
    const minFactor = 1.08;
    const maxFactor = 0.8;

    const t = Math.min(1, Math.max(0, (bodyWeight - minBw) / (maxBw - minBw)));
    const factor = minFactor + t * (maxFactor - minFactor);

    const scaledEliteBWRatio = BWRatio * factor;
    const ratio = oneRepMax / bodyWeight;
    const score = (ratio / scaledEliteBWRatio) * 100;
    return { score: Math.min(100, Math.round(score)), scaledElite: Number(scaledEliteBWRatio.toFixed(2)) };
};

export const calculateStrengthScoreReps = (reps: number, bodyWeight: number, eliteReps: number, isFemaleIndex: boolean) => {
    if (!bodyWeight || bodyWeight === 0) return { score: 0, scaledElite: 0 };

    const eReps = isFemaleIndex ? eliteReps * 0.7 : eliteReps;
    const minBw = 50;
    const maxBw = 140;
    const minFactor = 1.08;
    const maxFactor = 0.62;

    const t = Math.min(1, Math.max(0, (bodyWeight - minBw) / (maxBw - minBw)));
    const factor = minFactor + t * (maxFactor - minFactor);

    const scaledEliteReps = eReps * factor;
    const score = (reps / scaledEliteReps) * 100;
    return { score: Math.min(100, Math.round(score)), scaledElite: Number(scaledEliteReps.toFixed(0)) };
};
