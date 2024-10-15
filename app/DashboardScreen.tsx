import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DonutChart from "./DonutChart"; // Ensure this component is properly defined
import { Section, Goal, SectionData } from "./types"; // Assuming you have a types file
import DropDownMenu from "./DropDownMenu";

const Dashboard: React.FC = () => {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>("all");
  const [filteredData, setFilteredData] = useState<SectionData[]>([]);

  useEffect(() => {
    loadDashboardData();
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
          sectionGoals, // Store goals for future use
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

  // Filter section data based on selection
  useEffect(() => {
    if (selectedSection === "all") {
      setFilteredData(sectionData);
    } else {
      const filtered = sectionData.filter(
        (section) => section.title === selectedSection
      );
      setFilteredData(filtered);
    }
  }, [selectedSection, sectionData]);

  const handleValueChange = (value: string | null) => {
    setSelectedSection(value);
  };

  const chartWidth = Dimensions.get("window").width - 32; // Adjust padding as needed
  const chartHeight = 220;

  // Separate sections with goals from those without goals
  const sections = filteredData;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <DropDownMenu
        items={[
          {
            label: "All Sections",
            value: "all",
          },
          ...sectionData.map((section) => ({
            label: section.title,
            value: section.title,
          })),
        ]}
        selectedValue={selectedSection}
        onValueChange={handleValueChange}
      />

      {/* Only show donut chart if there are sections with goals */}
      {sections.some((section) => section.totalScore > 0) && (
        <View style={styles.chartContainer}>
          <DonutChart
            data={sections.filter((section) => section.totalScore > 0)} // Pass only sections with goals to the chart
            width={chartWidth}
            height={chartHeight}
          />
        </View>
      )}

      {/* Render all sections in one container */}
      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <View key={item.title} style={styles.legendItem}>
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
    </View>
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
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
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
});

export default Dashboard;
