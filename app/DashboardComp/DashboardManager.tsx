import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DailyCompletion,
  WeeklyStats,
  Goal,
  Section,
  SectionData,
  DailyRecord,
} from "../types";

export const DashboardManager = {
  async loadSectionData(
    date: string,
    sectionTitle: string
  ): Promise<SectionData | null> {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      if (!recordsData) return null;

      const dailyRecords: DailyRecord[] = JSON.parse(recordsData);
      const dayRecord = dailyRecords.find((record) => record.date === date);

      if (!dayRecord) return null;

      return (
        dayRecord.sections.find((section) => section.title === sectionTitle) ||
        null
      );
    } catch (error) {
      console.error("Error loading section data:", error);
      return null;
    }
  },

  async getDailyRecord(date: string): Promise<DailyRecord | null> {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      if (!recordsData) return null;

      const dailyRecords: DailyRecord[] = JSON.parse(recordsData);
      return dailyRecords.find((record) => record.date === date) || null;
    } catch (error) {
      console.error("Error getting daily record:", error);
      return null;
    }
  },

  async updateSectionGoals(
    date: string,
    sectionTitle: string,
    goals: Goal[]
  ): Promise<boolean> {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      if (!recordsData) return false;

      const dailyRecords: DailyRecord[] = JSON.parse(recordsData);
      const recordIndex = dailyRecords.findIndex(
        (record) => record.date === date
      );

      if (recordIndex === -1) return false;

      const sectionIndex = dailyRecords[recordIndex].sections.findIndex(
        (section) => section.title === sectionTitle
      );

      if (sectionIndex === -1) return false;

      // Update the goals while maintaining other section properties
      dailyRecords[recordIndex].sections[sectionIndex] = {
        ...dailyRecords[recordIndex].sections[sectionIndex],
        goals,
      };

      await AsyncStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));
      return true;
    } catch (error) {
      console.error("Error updating section goals:", error);
      return false;
    }
  },

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
      const sectionsData = await AsyncStorage.getItem("sections");
      if (goalsData && sectionsData) {
        const goals: Goal[] = JSON.parse(goalsData);
        const sections: Section[] = JSON.parse(sectionsData);
        const completedGoalIds = goals
          .filter((goal) => goal.completed)
          .map((goal) => goal.id);
        const today = new Date().toISOString().split("T")[0];

        const historyData = await AsyncStorage.getItem("completionHistory");
        const history: DailyCompletion[] = historyData
          ? JSON.parse(historyData)
          : [];

        // Store section data along with completed goals
        const sectionData = sections.map((section) => {
          const sectionGoals = goals.filter(
            (goal) => goal.sectionTitle === section.title
          );
          const totalScore = sectionGoals.reduce(
            (sum, goal) => sum + goal.score,
            0
          );
          const completedScore = sectionGoals
            .filter((goal) => goal.completed)
            .reduce((sum, goal) => sum + goal.score, 0);
          return {
            title: section.title,
            color: section.color,
            totalScore,
            completedScore,
            goals: sectionGoals,
          };
        });

        history.push({
          date: today,
          completedGoals: completedGoalIds,
          sectionData,
        });

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
      console.log(`History Data: ${historyData}`);
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
              goals: sectionGoals,
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
                    count === sortedGoals[sortedGoals.length - 1][1] &&
                    count > 0
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
