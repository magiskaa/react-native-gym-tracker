import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { WeightHistory } from "../../services/database";
import { formatDate } from "../../utils/Utils";

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

    const maxLabels = 6;
    const rawLabels = history.map((h) => formatDate(h.date).slice(0, 6));
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((label, i) => (i % step === 0 ? label : ""));

    const weightChartData = {
        labels,
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
                    labelColor: () => "#1e1e1e",
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
        color: "#1e1e1e",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center"
    },
    chart: {
        marginLeft: -23,
    },
});