import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import DonutChart from "./UI/DonutChart";
import { DailyRecord, SectionData } from "./types";
import DropDownMenu from "./UI/DropDownMenu";
import Header from "./Components/Header";
import DashboardManager from "./DashboardComp/DashboardManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateSelector from "./UI/DateSelector";
import { DailyCompletion, WeeklyStats, Goal, Section } from "./types";

const Dashboard: React.FC = () => {
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>("all");
  const [filteredData, setFilteredData] = useState<SectionData[]>([]);
  const [hasDataForSelectedDate, setHasDataForSelectedDate] =
    useState<boolean>(true);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // useEffect(() => {
  //   if (weeklyStats) {
  //     console.log("Weekly Stats:", JSON.stringify(weeklyStats, null, 2));
  //   } else {
  //     console.log("No weekly stats loaded yet");
  //   }
  // }, [weeklyStats]);

  useEffect(() => {
    loadDashboardData();
    // loadWeeklyStats();
  }, []);

  useEffect(() => {
    filterSectionData();
  }, [selectedSection, selectedDate, dailyRecords]);

  const filterSectionData = () => {
    const dailyRecord = dailyRecords.find(
      (record) => record.date === selectedDate
    );

    if (dailyRecord) {
      // Filter section data based on the selected section
      const updatedFilteredData =
        selectedSection === "all"
          ? dailyRecord.sections
          : dailyRecord.sections.filter(
              (section) => section.title === selectedSection
            );

      setFilteredData(updatedFilteredData);
    } else {
      setFilteredData([]); // Clear the data if no record is found
      console.error(`Error: No daily record found for date ${selectedDate}`);
    }
  };

  // useEffect(() => {
  //   // const todayDate = new Date().toISOString().split("T")[0]; // Get today's date
  //   const todayDate = selectedDate; // Get today's date
  //   const updatedFilteredData =
  //     selectedSection === "all"
  //       ? weeklyStats
  //         ? weeklyStats.dailyCompletions[selectedDate] || []
  //         : []
  //       : sectionData.filter((section) => section.title === selectedSection);

  //   // If the selected date is today, check if there's data for today
  //   if (selectedDate === todayDate) {
  //     // Filter the updatedFilteredData to find sections with goals for today
  //     const todayData = updatedFilteredData.filter((section) =>
  //       section.goals.some((goal) => {
  //         // Convert creationDate to a Date object
  //         const creationDate = new Date(goal.creationDate);

  //         // Check if creationDate is valid
  //         if (isNaN(creationDate.getTime())) {
  //           console.error("Invalid creationDate for goal:", goal);
  //           return false; // Skip this goal if the date is invalid
  //         }

  //         // Compare the date
  //         return creationDate.toISOString().split("T")[0] === todayDate;
  //       })
  //     );
  //     setFilteredData(todayData.length > 0 ? todayData : []);
  //   } else {
  //     setFilteredData(updatedFilteredData);
  //   }
  // }, [selectedSection, sectionData, weeklyStats, selectedDate]);

  const loadDashboardData = async () => {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      const records: DailyRecord[] = recordsData ? JSON.parse(recordsData) : [];
      setDailyRecords(records);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleValueChange = (value: string | null) => {
    if (value !== selectedSection) {
      console.log("Selected Section:", value);
      setSelectedSection(value);
    }
  };
  const dropdownItems = dailyRecords
    .flatMap((record) => record.sections)
    .map((section) => ({
      label: section.title,
      value: section.title,
    }));

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    // await loadDashboardData(); // Reload data for the new date
  };

  const chartWidth = Dimensions.get("window").width - 32;
  const chartHeight = 100;

  // Separate sections with goals from those without goals
  const sections = filteredData; //may neeed to add back to work   **********************************************************
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Header title="Dashboard" showDashboardButton={false} />
      </View>
      <DropDownMenu
        items={dropdownItems}
        selectedValue={selectedSection}
        onValueChange={handleValueChange}
      />
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        hasData={!!dailyRecords.find((record) => record.date === selectedDate)}
        filteredData={filteredData}
      />
      {filteredData.length > 0 ? (
        <View style={styles.chartContainer}>
          <DonutChart
            data={filteredData.filter((section) => section.totalScore > 0)}
            width={chartWidth}
            height={chartHeight}
          />
        </View>
      ) : (
        <Text style={styles.legendText}>
          No Data available for {selectedDate}
        </Text>
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
            Most Completed (
            {weeklyStats.mostCompletedGoals.length > 0
              ? `${weeklyStats.mostCompletedGoals.length} goals`
              : "No data"}
            ):{" "}
          </Text>
          {weeklyStats.mostCompletedGoals.map((goal, index) => (
            <Text key={goal.id} style={styles.goalText}>
              • {goal.name}
            </Text>
          ))}
          <Text style={[styles.statsText, { marginTop: 10 }]}>
            Least Completed (
            {weeklyStats.leastCompletedGoals.length > 0
              ? `${weeklyStats.leastCompletedGoals.length} goals`
              : "No data"}
            ):
          </Text>
          {weeklyStats.leastCompletedGoals.map((goal, index) => (
            <Text key={goal.id} style={styles.goalText}>
              • {goal.name}
            </Text>
          ))}
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
    marginBottom: 100,
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

  // dateSelector: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  //   marginBottom: 10,
  // },
  // dateButton: {
  //   padding: 5,
  //   borderRadius: 5,
  //   backgroundColor: "#2c2c2c",
  // },
  // selectedDateButton: {
  //   backgroundColor: "#7E57C2",
  // },
  // dateButtonText: {
  //   color: "#fff",
  // },
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
  goalText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
  },
});

export default Dashboard;
