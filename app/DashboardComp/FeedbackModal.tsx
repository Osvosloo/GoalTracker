import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyRecord } from "../types"; // Adjust the import path as necessary
import axios from "axios"; // Use axios for API calls

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [weeklyData, setWeeklyData] = useState<DailyRecord[]>([]);
  const COHERE_API_KEY = Constants.expoConfig?.extra?.COHERE_API_KEY;

  // Function to fetch the past 7 days of data from local storage
  const fetchWeeklyData = async () => {
    try {
      const allRecords = await AsyncStorage.getItem("dailyRecords");
      if (allRecords) {
        const parsedRecords: DailyRecord[] = JSON.parse(allRecords);
        const today = new Date();
        const pastWeekRecords = parsedRecords.filter((record) => {
          const recordDate = new Date(record.date);
          const diffTime = Math.abs(today.getTime() - recordDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 6; // Get records from the past 7 days (including today)
        });
        setWeeklyData(pastWeekRecords);
      }
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

  useEffect(() => {
    fetchWeeklyData(); // Fetch the past 7 days of data
  }, []);

  const handleSubmitFeedback = async () => {
    try {
      const formattedData = weeklyData.map((record) => ({
        date: record.date,
        sections: record.sections.map((section) => ({
          title: section.title,
          totalScore: section.totalScore,
          completedScore: section.completedScore,
          goalsCompleted: section.goals.filter((goal) => goal.completed).length,
          totalGoals: section.goals.length,
          necessityScore:
            section.totalScore > 0
              ? (section.completedScore / section.totalScore) * 100
              : 0,
        })),
      }));

      const prompt = `
      Analyze the following goal completion data for critical and supportive feedback to improve completion rates:
      ${JSON.stringify(formattedData)}
      `;

      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command-r-plus-08-2024", // Use the appropriate model
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFeedbackText(response.data.text);
      console.log(response.data.text);

      // Optionally, you can remove the last submission date check
      // await AsyncStorage.setItem(
      //   "lastSubmissionDate",
      //   new Date().toISOString().split("T")[0]
      // );
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Feedback</Text>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.feedbackText}>
            {feedbackText || "No feedback available yet."}
          </Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitFeedback}
        >
          <Text style={styles.submitButtonText}>Submit feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 200, // Adjust the maximum height as needed
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  closeButton: {
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default FeedbackModal;
