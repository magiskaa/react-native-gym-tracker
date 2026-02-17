import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Workout } from "../../services/workouts";
import { ChartStyles } from "../../styles/ChartStyles";
import { formatDateWOZeros, formatLocalDateISO } from "../../utils/Utils";

type WorkoutsPerWeekChartProps = {
    workouts: Workout[];
    weeksToShow?: number;
};

const parseLocalDate = (date: string) => {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const getWeekStartISO = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setHours(0, 0, 0, 0);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return formatLocalDateISO(d);
};

export default function WorkoutsPerWeekChart({ workouts, weeksToShow = 6 }: WorkoutsPerWeekChartProps) {
    const { labels, data } = useMemo(() => {
        const weekCounts = new Map<string, number>();
        workouts.forEach((workout) => {
            const workoutDate = parseLocalDate(workout.date);
            const weekStart = getWeekStartISO(workoutDate);
            weekCounts.set(weekStart, (weekCounts.get(weekStart) ?? 0) + 1);
        });

        const weeks: string[] = [];
        const today = new Date();
        const currentWeekStart = getWeekStartISO(today);
        const [cy, cm, cd] = currentWeekStart.split("-").map(Number);
        let cursor = new Date(cy, (cm ?? 1) - 1, cd ?? 1);

        for (let i = 0; i < weeksToShow; i += 1) {
            const weekStartISO = formatLocalDateISO(cursor);
            weeks.unshift(weekStartISO);
            cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7);
        }

        return {
            labels: weeks.map((week) => formatDateWOZeros(week)),
            data: weeks.map((week) => weekCounts.get(week) ?? 0),
        };
    }, [workouts, weeksToShow]);

    if (!workouts || workouts.length === 0) {
        return (
            <View style={ChartStyles.emptyContainer}>
                <Text style={ChartStyles.emptyText}>No workout history yet</Text>
            </View>
        );
    }

    const barWidth = Dimensions.get("window").width / 11.5;
    const maxValue = Math.max(1, ...data);
    const barData = data.map((count, index) => ({
        value: count,
        label: labels[index] ?? "",
        frontColor: "#20ca17",
    }));

    return (
        <View style={ChartStyles.container}>
            <BarChart
                height={200}
                data={barData}
                barWidth={barWidth}
                spacing={16}
                barBorderRadius={8}
                initialSpacing={0}
                endSpacing={0}
                rulesColor="#393939"
                rulesThickness={1}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#393939"
                yAxisTextStyle={{ color: "#767676", fontSize: 13 }}
                xAxisLabelTextStyle={{ color: "#767676", fontSize: 13 }}
                noOfSections={maxValue}
                maxValue={maxValue}
                isAnimated
                animationDuration={300}
                disableScroll
            />
        </View>
    );
}
