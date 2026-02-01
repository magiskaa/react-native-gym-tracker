import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ChartStyles } from "../../styles/ChartStyles";

type ExerciseChartProps = {
    history: { avgReps: number, avgWeight: number, date: string }[];
};

export default function ExerciseChart({ history }: ExerciseChartProps) {
    if (history.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>Not enough data to display chart</Text>
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
        <View style={ChartStyles.container}>
            <Text style={ChartStyles.chartTitle}>Reps per Set</Text>
            <LineChart
                data={repsChartData}
                width={chartWidth}
                height={160}
                chartConfig={{
                    decimalPlaces: 1,
                    color: () => "#20ca17",
                    labelColor: () => "#f1f1f1",
                    propsForLabels: {
                        fontSize: 12,
                    }
                }}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={false}
                segments={3}
                style={ChartStyles.chart}
                bezier
                transparent
            />

            <Text style={ChartStyles.chartTitle}>Weight per Set</Text>
            <LineChart
                data={weightChartData}
                width={chartWidth}
                height={160}
                chartConfig={{
                    decimalPlaces: 1,
                    color: () => "#4a9eff",
                    labelColor: () => "#f1f1f1",
                    propsForLabels: {
                        fontSize: 12,
                    }
                }}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={false}
                segments={3}
                style={{ ...ChartStyles.chart, marginBottom: 0 }}
                bezier
                transparent
            />
        </View>
    );
}
