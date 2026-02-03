import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { WeightEntry } from "../../services/weights";
import { formatDateWOZeros } from "../../utils/Utils";
import { ChartStyles } from "../../styles/ChartStyles";

type Props = {
    history: WeightEntry[];
    startingWeight: number;
    weightGoal: number | null;
};

export default function PhaseChart({ history, startingWeight, weightGoal }: Props) {
    if (history.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const maxLabels = 7;
    const rawLabels = history.map((h) => formatDateWOZeros(h.date));
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((label, i) => (i % step === 0 ? label : ""));

    const weightChartData = {
        labels,
        datasets: [
            {
                data: history.map((h) => h.weight),
                color: () => "#4a9eff",
                strokeWidth: 2,
                withDots: true,
            },
            {
                data: [startingWeight],
                withDots: false,
                strokeWidth: 0,
            },
            {
                data: [weightGoal || startingWeight + 5],
                withDots: false,
                strokeWidth: 0,
            },
        ],
    };

    return (
        <View style={ChartStyles.container}>
            <Text style={ChartStyles.chartTitle}>Weight (kg)</Text>
            <LineChart
                data={weightChartData}
                width={chartWidth}
                height={220}
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
                segments={5}
                style={ChartStyles.chart}
                bezier
                transparent
            />
        </View>
    );
}
