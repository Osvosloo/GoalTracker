import AsyncStorage from "@react-native-async-storage/async-storage";
import { Goal, Section, SectionData } from "./types";

export interface DailyCompletion {
  date: string;
  completedGoals: string[]; // Array of goal IDs
}

export interface WeeklyStats {
  mostCompletedGoals: { id: string; name: string }[];
  leastCompletedGoals: { id: string; name: string }[];
  dailyCompletions: { [date: string]: SectionData[] };
}

export const DashboardManager = {
  resetDailyGoals: async () => {
    try {
      const goalsData = await AsyncStorage.getItem("goals");
      if (goalsData) {
        const goals: Goal[] = JSON.parse(goalsData);
        const resetGoals = goals.map((goal) => ({ ...goal, completed: false }));
        await AsyncStorage.setItem("goals", JSON.stringify(resetGoals));
      }
    } catch (error) {
      console.error("Failed to reset daily goals:", error);
    }
  },

  storeCompletedGoals: async () => {
    try {
      const goalsData = await AsyncStorage.getItem("goals");
      if (goalsData) {
        const goals: Goal[] = JSON.parse(goalsData);
        const completedGoalIds = goals
          .filter((goal) => goal.completed)
          .map((goal) => goal.id);
        const today = new Date().toISOString().split("T")[0];

        const historyData = await AsyncStorage.getItem("completionHistory");
        const history: DailyCompletion[] = historyData
          ? JSON.parse(historyData)
          : [];

        history.push({ date: today, completedGoals: completedGoalIds });

        // Keep only the last 7 days
        const last7Days = history.slice(-7);

        await AsyncStorage.setItem(
          "completionHistory",
          JSON.stringify(last7Days)
        );
      }
    } catch (error) {
      console.error("Failed to store completed goals:", error);
    }
  },

  getWeeklyStats: async (): Promise<WeeklyStats> => {
    try {
      const historyData = await AsyncStorage.getItem("completionHistory");
      const goalsData = await AsyncStorage.getItem("goals");
      const sectionsData = await AsyncStorage.getItem("sections");

      if (historyData && goalsData && sectionsData) {
        const history: DailyCompletion[] = JSON.parse(historyData);
        const goals: Goal[] = JSON.parse(goalsData);
        const sections: Section[] = JSON.parse(sectionsData);

        const goalCompletionCount: { [goalId: string]: number } = {};
        const dailyCompletions: { [date: string]: SectionData[] } = {};

        history.forEach((day) => {
          day.completedGoals.forEach((goalId) => {
            goalCompletionCount[goalId] =
              (goalCompletionCount[goalId] || 0) + 1;
          });

          const sectionData = sections.map((section) => {
            const sectionGoals = goals.filter(
              (goal) => goal.sectionTitle === section.title
            );
            const totalScore = sectionGoals.reduce(
              (sum, goal) => sum + goal.score,
              0
            );
            const completedScore = sectionGoals
              .filter((goal) => day.completedGoals.includes(goal.id))
              .reduce((sum, goal) => sum + goal.score, 0);

            return {
              ...section,
              totalScore,
              completedScore,
            };
          });

          dailyCompletions[day.date] = sectionData;
        });

        const sortedGoals = Object.entries(goalCompletionCount).sort(
          (a, b) => b[1] - a[1]
        );

        const createGoalObject = (id: string) => {
          const goal = goals.find((g) => g.id === id);
          return { id, name: goal ? goal.name : "Unknown Goal" };
        };

        const mostCompletedGoals =
          sortedGoals.length > 0
            ? sortedGoals
                .filter(([, count]) => count === sortedGoals[0][1])
                .map(([id]) => createGoalObject(id))
            : [];

        const leastCompletedGoals =
          sortedGoals.length > 0
            ? sortedGoals
                .filter(
                  ([, count]) =>
                    count === sortedGoals[sortedGoals.length - 1][1]
                )
                .map(([id]) => createGoalObject(id))
            : [];

        return {
          mostCompletedGoals,
          leastCompletedGoals,
          dailyCompletions,
        };
      }

      return {
        mostCompletedGoals: [],
        leastCompletedGoals: [],
        dailyCompletions: {},
      };
    } catch (error) {
      console.error("Failed to get weekly stats:", error);
      return {
        mostCompletedGoals: [],
        leastCompletedGoals: [],
        dailyCompletions: {},
      };
    }
  },
};

export default DashboardManager;
