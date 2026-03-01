import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type SetRow = { reps: string; weight: string };
type SetsByExercise = Record<number, SetRow[]>;

type WorkoutSelectionContextValue = {
    selectedIds: Set<number>;
    setSelectedIds: (next: Set<number>) => void;
    toggleExercise: (id: number) => void;
    resetSelection: () => void;

    isWorkoutActive: boolean;
    startedAtMs: number | null;
    workoutName: string;
    setsByExercise: SetsByExercise;

    startWorkoutSession: (initialSelectedIds: Set<number>) => void;
    updateWorkoutName: (name: string) => void;
    setSetsForExercise: (exerciseId: number, sets: SetRow[]) => void;
    resetWorkoutSession: () => void;
};

const WorkoutSelectionContext = createContext<WorkoutSelectionContextValue | null>(null);

export function WorkoutSelectionProvider({ children }: { children: React.ReactNode }) {
    const [selectedIdsState, setSelectedIdsState] = useState<Set<number>>(new Set());
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
    const [workoutName, setWorkoutName] = useState("");
    const [setsByExercise, setSetsByExercise] = useState<SetsByExercise>({});

    const setSelectedIds = useCallback((next: Set<number>) => {
        setSelectedIdsState(new Set(next));
    }, []);

    const toggleExercise = useCallback((id: number) => {
        setSelectedIdsState((prev) => {
        const next = new Set(prev);
            if (next.has(id)) { next.delete(id); }
            else { next.add(id); }
            return next;
        });
    }, []);

    const resetSelection = useCallback(() => setSelectedIdsState(new Set()), []);

    const updateWorkoutName = useCallback((name: string) => setWorkoutName(name), []);

    const setSetsForExercise = useCallback((exerciseId: number, sets: SetRow[]) => {
        setSetsByExercise((prev) => ({ ...prev, [exerciseId]: sets }));
    }, []);

    const startWorkoutSession = useCallback((initialSelectedIds: Set<number>) => {
        setSelectedIdsState(new Set(initialSelectedIds));
        setIsWorkoutActive(true);
        setStartedAtMs((prev) => prev ?? Date.now());
        setWorkoutName((prev) => prev || "Workout");
        setSetsByExercise((prev) => {
            const next: SetsByExercise = { ...prev };
            initialSelectedIds.forEach((id) => {
                if (!next[id]) next[id] = [{ reps: "", weight: "" }];
            });
            return next;
        });
    }, []);

    const resetWorkoutSession = useCallback(() => {
        setIsWorkoutActive(false);
        setStartedAtMs(null);
        setWorkoutName("");
        setSetsByExercise({});
        setSelectedIdsState(new Set());
    }, []);

    const value = useMemo(
        () => ({
            selectedIds: selectedIdsState,
            setSelectedIds,
            toggleExercise,
            resetSelection,
            isWorkoutActive,
            startedAtMs,
            workoutName,
            setsByExercise,
            startWorkoutSession,
            updateWorkoutName,
            setSetsForExercise,
            resetWorkoutSession,
        }),
        [
            selectedIdsState, setSelectedIds, toggleExercise, resetSelection,
            isWorkoutActive, startedAtMs, workoutName, setsByExercise,
            startWorkoutSession, updateWorkoutName, setSetsForExercise, resetWorkoutSession
        ]
    );

    return (
        <WorkoutSelectionContext.Provider value={value}>
            {children}
        </WorkoutSelectionContext.Provider>
    );
}

export function useWorkoutSelection() {
    const ctx = useContext(WorkoutSelectionContext);
    if (!ctx) throw new Error("useWorkoutSelection must be used inside WorkoutSelectionProvider");
    return ctx;
}