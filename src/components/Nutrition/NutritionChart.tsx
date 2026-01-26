import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { NutritionRow } from "../../services/database";
import { formatDate, formatDateWOZeros } from "../../utils/Utils";
import { ChartStyles } from "../../styles/ChartStyles";

type Props = {
    history: NutritionRow[];
};

export default function NutritionChart({ history }: Props) {
    if (history.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const reversed = history.reverse();

    const maxLabels = 7;
    const rawLabels = reversed.map((h) => formatDateWOZeros(h.date));
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((label, i) => (i % step === 0 ? label : ""));

    const calorieChartData = {
        labels,
        datasets: [
            {
                data: reversed.map((h) => (h.calories || 0)),
                color: () => "#20ca17",
                strokeWidth: 2,
                withDots: true,
            },
            {
                data: reversed.map(() => 3000),
                color: () => "#626262",
                strokeWidth: 2,
                withDots: false,
            },
        ],
    };
    
    const proteinChartData = {
        labels,
        datasets: [
            {
                data: reversed.map((h) => (h.protein || 0)),
                color: () => "#4a9eff",
                strokeWidth: 2,
                withDots: true,
            },
            {
                data: reversed.map(() => 3000),
                color: () => "#626262",
                strokeWidth: 2,
                withDots: false,
            },
        ],
    };

    return (
        <View style={ChartStyles.container}>
            <Text style={ChartStyles.chartTitle}>Calories</Text>
            <LineChart
                data={calorieChartData}
                width={chartWidth}
                height={220}
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
                segments={5}
                style={ChartStyles.chart}
                bezier
                transparent
            />

            {/* <Text style={ChartStyles.chartTitle}>Protein</Text>
            <LineChart
                data={proteinChartData}
                width={chartWidth}
                height={220}
                chartConfig={{
                    decimalPlaces: 1,
                    color: () => "#4a9eff",
                    labelColor: () => "#1e1e1e",
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
            /> */}
        </View>
    );
}
