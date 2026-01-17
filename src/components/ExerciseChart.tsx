import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ExerciseHistory } from "../services/database";

type ExerciseChartProps = {
    history: ExerciseHistory[];
};

export default function ExerciseChart({ history }: ExerciseChartProps) {
    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const repsChartData = {
        labels: history.map((h) => h.date),
        datasets: [
            {
                data: history.map((h) => h.avgReps),
                color: () => "#20ca17",
                strokeWidth: 2,
            },
        ],
    };

    const weightChartData = {
        labels: history.map((h) => h.date),
        datasets: [
            {
                data: history.map((h) => h.avgWeight),
                color: () => "#4a9eff",
                strokeWidth: 2,
            },
        ],
    };

    return (
        <View style={styles.container}>
            <Text style={styles.chartTitle}>Reps per Set</Text>
            <LineChart
                data={repsChartData}
                width={chartWidth}
                height={160}
                chartConfig={{
                    backgroundColor: "#1e1e1e",
                    backgroundGradientFrom: "#1e1e1e",
                    backgroundGradientTo: "#1e1e1e",
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
                segments={3}
                style={styles.chart}
                bezier
            />

            <Text style={styles.chartTitle}>Weight per Set</Text>
            <LineChart
                data={weightChartData}
                width={chartWidth}
                height={160}
                chartConfig={{
                    backgroundColor: "#1e1e1e",
                    backgroundGradientFrom: "#1e1e1e",
                    backgroundGradientTo: "#1e1e1e",
                    decimalPlaces: 1,
                    color: () => "#4a9eff",
                    labelColor: () => "#c7c7c7",
                    propsForLabels: {
                        fontSize: 12,
                    }
                }}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={false}
                segments={3}
                style={{ ...styles.chart, marginBottom: 0 }}
                bezier
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
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
        marginBottom: 12,
        marginLeft: -23
    },
});