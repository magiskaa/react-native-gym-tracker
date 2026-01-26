import { StyleSheet } from "react-native"

export const ChartStyles = StyleSheet.create({
    container: {
        margin: "auto",
        marginBottom: 0,
        padding: 0,
        borderRadius: 12,
    },
    emptyContainer: {
        marginTop: 16,
        padding: 20,
        alignItems: "center",
    },
    emptyText: {
        color: "#6b6b6b",
        fontSize: 14,
    },
    chartTitle: {
        color: "#f1f1f1",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 8,
        textAlign: "center"
    },
    chart: {
        marginLeft: -23,
    },
});