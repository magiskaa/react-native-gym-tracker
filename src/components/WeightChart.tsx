import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { WeightHistory } from "../services/database";

type WeightChartProps = {
    history: WeightHistory[];
};

export default function WeightChart({ history }: WeightChartProps) {
    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const weightChartData = {
        labels: history.map((h) => h.date),
        datasets: [
            {
                data: history.map((h) => h.weight),
                color: () => "#20ca17",
                strokeWidth: 2,
                withDots: true,
            },
            /* {
                data: [80],
                withDots: false,
                strokeWidth: 0,
            },
            {
                data: [95],
                withDots: false,
                strokeWidth: 0,
            }, */
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.chartTitle}>Weight (kg)</Text>
            <LineChart
                data={weightChartData}
                width={chartWidth}
                height={220}
                chartConfig={{
                    decimalPlaces: 1,
                    color: () => "#20ca17",
                    labelColor: () => "#c7c7c7",
                    propsForLabels: {
                        fontSize: 12,
                    }
                }}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={false}
                segments={5}
                style={styles.chart}
                bezier
                transparent
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: "auto",
        marginBottom: 0,
        backgroundColor: "#1e1e1e",
        padding: 14,
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
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center"
    },
    chart: {
        marginLeft: -23,
    },
});