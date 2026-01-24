export const formatDate = (date: string) => {
    const parts = date.split("-");
    return `${parts[2].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[0]}`
};