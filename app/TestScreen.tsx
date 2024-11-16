import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  getAllSections,
  getDailyRecords,
  getExistingData,
} from "@/scripts/getFromStorage";

export default function TestScreen() {
  const [logContent, setLogContent] = useState<string>("");

  const logAllSections = async () => {
    const today = new Date().toISOString().split("T")[0];
    const sections = await getAllSections(today);
    setLogContent(
      `All Sections for today: ${JSON.stringify(sections, null, 2)}`
    );
  };

  const logDailyRecords = async () => {
    const records = await getDailyRecords();
    setLogContent(`Daily Records: ${JSON.stringify(records, null, 2)}`);
  };

  const logExistingData = async () => {
    const records = await getExistingData();
    setLogContent(`Existing Data: ${JSON.stringify(records, null, 2)}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Test</Text>
      </View>

      {/* ScrollView for content and buttons */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Log Content */}
        <Text style={styles.scrollText}>{logContent}</Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={logAllSections}>
            <Text style={styles.closeButtonText}>Log All Sections</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={logDailyRecords}
          >
            <Text style={styles.closeButtonText}>Log Daily Records</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={logExistingData}
          >
            <Text style={styles.closeButtonText}>Get Existing Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    // flexGrow: 1, // Allow the ScrollView to grow
    width: "100%",
  },
  scrollText: {
    fontSize: 10,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  headerText: {
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "column", // Change to column for vertical layout
    alignItems: "center", // Center buttons horizontally
    padding: 10,
    width: "100%",
  },
  closeButton: {
    backgroundColor: "#121212",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderColor: "#121212",
    borderWidth: 1,
    width: "80%",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
