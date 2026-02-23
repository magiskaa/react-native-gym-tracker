import { View, Text, Alert, useWindowDimensions } from "react-native";
import { formatDateWOZeros } from "../../utils/Utils";
import { ChartStyles } from "../../styles/ChartStyles";
import { useEffect, useState } from "react";
import { Nutrition } from "../../services/nutrition";
import { getNutritionGoals } from "../../services/nutritionGoals";
import { useAuthContext } from "../../auth/UseAuthContext";
import { LineChart } from "react-native-gifted-charts";


type Props = {
    history: Nutrition[];
};

export default function NutritionChart({ history }: Props) {
    const { session } = useAuthContext();
    const { width } = useWindowDimensions();
    const [calorieGoal, setCalorieGoal] = useState<number | null>(null);
    const [proteinGoal, setProteinGoal] = useState<number | null>(null);

    const loadData = async () => {
        if (!session?.user.id) { 
            Alert.alert("Failed to load data", "Please sign in again");
            return; 
        }

        try {
            const nutritionGoalsData = await getNutritionGoals(session.user.id);
            setCalorieGoal(nutritionGoalsData[0].calorieGoal);
            setProteinGoal(nutritionGoalsData[0].proteinGoal);

        } catch (error) {
			Alert.alert("Failed to load data", "Please try again later");
			console.error(`Failed to load data: ${error}`);
        }
    };

    useEffect(() => {
        loadData();
    }, [session?.user.id]);

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

    const reversed = [...history].reverse();

    const maxLabels = 7;
    const rawLabels = reversed.map((h) => formatDateWOZeros(h.date));
    const step = Math.max(1, Math.ceil(rawLabels.length / maxLabels));
    const labels = rawLabels.map((label, i) => (i % step === 0 ? label : ""));

    const calorieGoalData = reversed.map(() => ({value: calorieGoal || 0}));
    const calorieData = reversed.map((h, index) => ({
        value: h.calories || 0,
        label: labels[index],
    }));

    const proteinGoalData = reversed.map(() => ({value: proteinGoal || 0}));
    const proteinData = reversed.map((h, index) => ({
        value: h.protein || 0,
        label: labels[index],
    }));
    
    return (
        <View style={{}}>
            <Text style={ChartStyles.chartTitle}>Calories</Text>
            <LineChart
                isAnimated
                width={chartWidth}
                adjustToWidth
                thickness1={2}
                thickness2={2}
                color1="#20ca17"
                color2="#868686"
                noOfSections={4}
                animateOnDataChange
                animationDuration={500}
                onDataChangeAnimationDuration={300}
                areaChart1
                yAxisTextStyle={ChartStyles.yAxisText}
                xAxisLabelTextStyle={ChartStyles.xAxisText}
                data={calorieData}
                data2={calorieGoalData}
                hideDataPoints1
                hideDataPoints2
                startFillColor1={"#20ca17"}
                endFillColor1={"#20ca17"}
                startOpacity1={0.45}
                endOpacity1={0.01}
                spacing={dynamicSpacing}
                rulesColor="#393939"
                rulesType="solid"
                initialSpacing={edgeSpacing}
                endSpacing={0}
                yAxisThickness={0}
                xAxisColor="#767676"
            />

            <Text style={[ChartStyles.chartTitle, { marginTop: 32 }]}>Protein</Text>
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
                data={proteinData}
                data2={proteinGoalData}
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
            />
        </View>
    );
}
