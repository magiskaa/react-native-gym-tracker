import { View, Text, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { WeightEntry } from "../../services/weights";
import { formatDateWOZeros } from "../../utils/Utils";
import { ChartStyles } from "../../styles/ChartStyles";

type Props = {
    history: WeightEntry[];
    startingWeight: number;
    weightGoal: number | null;
};

export default function PhaseChart({ history, startingWeight, weightGoal }: Props) {
    const { width } = useWindowDimensions();

    if (history.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>Not enough data to display chart</Text>
            </View>
        );
    }

    const chartWidth = width - 108;
    const pointCount = history.length;
    const edgeSpacing = 16;
    const usableWidth = Math.max(0, chartWidth - edgeSpacing * 2);
    const dynamicSpacing = pointCount > 1
        ? Math.max(1, Math.floor(usableWidth / (pointCount - 1)))
        : 0;

    const maxLabels = 7;
    const rawLabels = history.map((h) => formatDateWOZeros(h.date));
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((label, i) => (i % step === 0 ? label : ""));

    const weightGoalData = history.map(() => ({value: weightGoal || 0}));
    const weightData = history.map((h, index) => ({
        value: h.weight || 0,
        label: labels[index],
    }));

    return (
        <View style={ChartStyles.container}>
            <Text style={ChartStyles.chartTitle}>Weight (kg)</Text>
            <LineChart
                isAnimated
                width={chartWidth}
                adjustToWidth
                thickness1={2}
                thickness2={2}
                color1="#4a9eff"
                color2="#868686"
                noOfSections={4}
                animateOnDataChange
                animationDuration={500}
                onDataChangeAnimationDuration={300}
                areaChart1
                yAxisTextStyle={ChartStyles.yAxisText}
                xAxisLabelTextStyle={ChartStyles.xAxisText}
                data={weightData}
                data2={weightGoalData}
                hideDataPoints1
                hideDataPoints2
                startFillColor1={"#4a9eff"}
                endFillColor1={"#4a9eff"}
                startOpacity1={0.45}
                endOpacity1={0.01}
                spacing={dynamicSpacing}
                rulesColor="#393939"
                rulesType="solid"
                initialSpacing={edgeSpacing}
                endSpacing={0}
                yAxisThickness={0}
                xAxisColor="#767676"
                yAxisOffset={startingWeight}
                disableScroll
            />
        </View>
    );
}
