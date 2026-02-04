import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { formatDate, formatDateWOZeros } from "../../utils/Utils";
import { ChartStyles } from "../../styles/ChartStyles";
import { useEffect, useState } from "react";
import { Nutrition } from "../../services/nutrition";
import { getNutritionGoals } from "../../services/nutritionGoals";
import { useAuthContext } from "../../auth/UseAuthContext";


type Props = {
    history: Nutrition[];
};

export default function NutritionChart({ history }: Props) {
    const { session } = useAuthContext();
    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

    const loadData = async () => {
        if (!session?.user.id) { 
            Alert.alert("Failed to load data", "Please sign in again");
            return; 
        }

        const data = await getNutritionGoals(session.user.id);
        setCalorieGoal(data[0].calorieGoal);
    };

    useEffect(() => {
        loadData();
    });

    if (history.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = Dimensions.get("window").width - 50;

    const reversed = [...history].reverse();

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
                data: reversed.map(() => (calorieGoal || 0)),
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
                data: reversed.map(() => 150),
                color: () => "#626262",
                strokeWidth: 2,
                withDots: false,
            },
        ],
    };

    return (
        <View style={[ChartStyles.container, styles.card]}>
            <Text style={[ChartStyles.chartTitle, styles.title]}>Calories</Text>
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
                style={{ ...ChartStyles.chart, ...styles.chart }}
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

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#2b2b2b",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#393939",
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    title: {
        fontSize: 14,
        letterSpacing: 0.2,
        color: "#f1f1f1",
        marginTop: 0,
        marginBottom: 4,
    },
    chart: {
        marginLeft: -12,
    },
});
