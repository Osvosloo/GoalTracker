import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DonutChart from "./DonutChart";
import { SectionData } from "./types";
import DropDownMenu from "./DropDownMenu";
import Header from "./Header";
import DashboardManager, { WeeklyStats } from "./DashboardManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard: React.FC = () => {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>("all");
  const [filteredData, setFilteredData] = useState<SectionData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadDashboardData();
    loadWeeklyStats();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sectionsData = await AsyncStorage.getItem("sections");
      const goalsData = await AsyncStorage.getItem("goals");

      const sections: Section[] = sectionsData ? JSON.parse(sectionsData) : [];
      const goals: Goal[] = goalsData ? JSON.parse(goalsData) : [];

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
          sectionGoals,
        };
      });

      setSectionData(dashboardData);
      setFilteredData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setSectionData([]);
      setFilteredData([]);
    }
  };

  const loadWeeklyStats = async () => {
    const stats = await DashboardManager.getWeeklyStats();
    setWeeklyStats(stats);
    if (stats.dailyCompletions[selectedDate]) {
      setFilteredData(stats.dailyCompletions[selectedDate]);
    }
  };

  useEffect(() => {
    if (selectedSection === "all" && weeklyStats) {
      setFilteredData(weeklyStats.dailyCompletions[selectedDate] || []);
    } else {
      const filtered = sectionData.filter(
        (section) => section.title === selectedSection
      );
      setFilteredData(filtered);
    }
  }, [selectedSection, sectionData, weeklyStats, selectedDate]);

  const handleValueChange = (value: string | null) => {
    setSelectedSection(value);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (weeklyStats && weeklyStats.dailyCompletions[date]) {
      setFilteredData(weeklyStats.dailyCompletions[date]);
    }
  };

  const chartWidth = Dimensions.get("window").width - 32;
  const chartHeight = 220;

  // Separate sections with goals from those without goals
  const sections = filteredData; //may neeed to add back to work   **********************************************************
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Header title="Dashboard" showDashboardButton={false} />
      </View>
      <DropDownMenu
        items={[
          { label: "All Sections", value: "all" },
          ...sectionData.map((section) => ({
            label: section.title,
            value: section.title,
          })),
        ]}
        selectedValue={selectedSection}
        onValueChange={handleValueChange}
      />
      <View style={styles.dateSelector}>
        {weeklyStats &&
          Object.keys(weeklyStats.dailyCompletions).map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateButton,
                date === selectedDate && styles.selectedDateButton,
              ]}
              onPress={() => handleDateChange(date)}
            >
              <Text style={styles.dateButtonText}>
                {new Date(date).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
      {filteredData.some((section) => section.totalScore > 0) && (
        <View style={styles.chartContainer}>
          <DonutChart
            data={filteredData.filter((section) => section.totalScore > 0)}
            width={chartWidth}
            height={chartHeight}
          />
        </View>
      )}
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={styles.legendText}>{item.title}</Text>
            <Text style={styles.legendScore}>
              {item.totalScore > 0
                ? `${item.completedScore}/${item.totalScore}`
                : "No Goals"}
            </Text>
            <Text style={styles.legendScore}>
              {item.totalScore > 0
                ? `${((item.completedScore / item.totalScore) * 100).toFixed(
                    0
                  )}%`
                : "0%"}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.title}
      />
      {weeklyStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsHeader}>Weekly Stats</Text>
          <Text style={styles.statsText}>
            Most Completed: {weeklyStats.mostCompletedGoals.join(", ")}
          </Text>
          <Text style={styles.statsText}>
            Least Completed: {weeklyStats.leastCompletedGoals.join(", ")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 80,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#7E57C2",
    // flex: 1,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    marginHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    marginHorizontal: 20,
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
    width: 60,
    textAlign: "right",
  },

  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  dateButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#2c2c2c",
  },
  selectedDateButton: {
    backgroundColor: "#7E57C2",
  },
  dateButtonText: {
    color: "#fff",
  },
  statsContainer: {
    padding: 10,
    backgroundColor: "#2c2c2c",
    margin: 10,
    borderRadius: 5,
  },
  statsHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default Dashboard;
