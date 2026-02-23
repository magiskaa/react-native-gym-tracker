import { StyleSheet } from "react-native"

export const ChartStyles = StyleSheet.create({
    container: {
        margin: "auto",
        padding: 0,
        borderRadius: 12,
        width: "100%",
    },
    emptyContainer: {
        paddingVertical: 100,
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
        marginLeft: -22,
    },
    yAxisText: {
        color: "#767676", 
        fontSize: 13, 
        marginRight: 4,
    },
    xAxisText: {
        color: "#767676", 
        fontSize: 13, 
        marginLeft: 0, 
        width: 28,
    },
});