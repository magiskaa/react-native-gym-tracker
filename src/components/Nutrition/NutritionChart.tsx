import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { NutritionRow } from "../../services/database";
import { formatDate } from "../../utils/Utils";

type Props = {
    history: NutritionRow[];
};

export default function NutritionChart({ history }: Props) {
    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const reversed = history.reverse();

    const maxLabels = 6;
    const rawLabels = reversed.map((h) => formatDate(h.date).slice(0, 6));
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
        <View style={styles.container}>
            <Text style={styles.chartTitle}>Calories</Text>
            <LineChart
                data={calorieChartData}
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

            {/* <Text style={styles.chartTitle}>Protein</Text>
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
                style={styles.chart}
                bezier
                transparent
            /> */}
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