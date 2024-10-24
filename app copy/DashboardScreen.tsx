import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DonutChart from "./DonutChart"; // Make sure to create this file
import { FadeInRight } from "react-native-reanimated";

interface Section {
  title: string;
  color: string;
}

interface Goal {
  id: string;
  name: string;
  score: number;
  completed: boolean;
  sectionTitle: string;
}

interface SectionData extends Section {
  totalScore: number;
  completedScore: number;
}

const Dashboard: React.FC = () => {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sectionsData = await AsyncStorage.getItem("sections");
      const goalsData = await AsyncStorage.getItem("goals");

      if (sectionsData && goalsData) {
        const sections: Section[] = JSON.parse(sectionsData);
        const goals: Goal[] = JSON.parse(goalsData);

        const dashboardData: SectionData[] = sections.map((section) => {
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
            ...section,
            totalScore,
            completedScore,
          };
        });

        setSectionData(dashboardData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const chartWidth = Dimensions.get("window").width - 32; // Adjust padding as needed
  const chartHeight = 220;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <View style={styles.chartContainer}>
        <DonutChart
          data={sectionData}
          width={chartWidth}
          height={chartHeight}
        />
      </View>
      <View style={styles.legendContainer}>
        {sectionData.map((section) => (
          <View key={section.title} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: section.color }]}
            />
            <Text style={styles.legendText}>{section.title}</Text>
            <Text style={styles.legendScore}>
              {section.completedScore}/{section.totalScore}
            </Text>
            <Text style={styles.legendScore}>
              {section.totalScore > 0
                ? `${(
                    (section.completedScore / section.totalScore) *
                    100
                  ).toFixed(0)}%`
                : "0%"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendColor: {
    width: 10,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  legendScore: {
    color: "#fff",
    fontSize: 16,
    width: 40,
    textAlign: "right",
  },
});

export default Dashboard;
