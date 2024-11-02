import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import DonutChart from "./UI/DonutChart";
import { DailyRecord, SectionData } from "./types";
import DropDownMenu from "./UI/DropDownMenu";
import Header from "./Components/Header";
import DashboardManager from "./DashboardComp/DashboardManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateSelector from "./UI/DateSelector";
import { DailyCompletion, WeeklyStats, Goal, Section } from "./types";
import SectionList from "./UI/SectionList";
import { router, Router } from "expo-router";
import FeedbackModal from "./DashboardComp/FeedbackModal";
import { MaterialIcons } from "@expo/vector-icons";
import { Tooltip } from "react-native-paper";

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
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  router;
  const [modalVisible, setModalVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterSectionData();
  }, [selectedSection, selectedDate, dailyRecords]);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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
    }
  };

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

  const getSectionsForSelectedDate = () => {
    const dailyRecord = dailyRecords.find(
      (record) => record.date === selectedDate
    );

    return dailyRecord ? dailyRecord.sections : [];
  };

  const dropdownItems = getSectionsForSelectedDate()
    .filter((section) => section.title !== selectedSection) // Exclude the selected section
    .map((section) => ({
      label: section.title,
      value: section.title,
    }));

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    const today = new Date().toISOString().split("T")[0];
    const isHistorical = date !== today; // Check if the selected date is historical
    setIsHistoricalView(isHistorical); // Set the historical view state
    await loadDashboardData(); // Optionally reload data for the new date
  };

  const handleSectionPress = (sectionTitle: any) => {
    router.push({
      pathname: "/SectionScreen",
      params: {
        title: sectionTitle,
        date: selectedDate, // Pass the selected date here
        isHistorical: isHistoricalView.toString(), // Pass historical view state
      },
    });
  };

  const chartWidth = Dimensions.get("window").width - 32;
  const chartHeight = 100;

  // Separate sections with goals from those without goals
  const sections = filteredData; //may neeed to add back to work   **********************************************************
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { marginBottom: Platform.OS === "web" ? 10 : 100 },
        ]}
      >
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
      <View style={styles.chartContainer}>
        {filteredData.length > 0 && (
          <DonutChart
            data={filteredData.filter((section) => section.totalScore > 0)}
            width={chartWidth}
            height={chartHeight}
          />
        )}
      </View>
      {/* <SectionList filteredData={filteredData} /> */}
      <SectionList
        filteredData={filteredData}
        isHistorical={isHistoricalView} // Pass isHistoricalView state
        selectedDate={selectedDate}
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

      <Tooltip
        title="Give Feedback"
        enterTouchDelay={200}
        leaveTouchDelay={200}
      >
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleOpenModal}
          onPressIn={() => setTooltipVisible(true)} // Show tooltip on press
          onPressOut={() => setTooltipVisible(false)} // Hide tooltip when not pressed
        >
          <MaterialIcons name="lightbulb-outline" size={30} color="#000" />
        </TouchableOpacity>
      </Tooltip>

      {/* Feedback Modal */}
      <FeedbackModal visible={modalVisible} onClose={handleCloseModal} />
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
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    marginHorizontal: 16,
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
  goalText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff", // Change to your desired color
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Dashboard;
