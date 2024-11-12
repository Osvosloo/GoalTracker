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
import axios from "axios"; // Use axios for API calls
import { DailyRecord } from "../types"; // Adjust the import path as necessary
import {
  getAllSections,
  fetchWeeklyData,
  getDailyRecords,
} from "@/scripts/getFromStorage"; // Adjust import path
import { cleanupOldRecords } from "@/scripts/dataStructureManager"; // Adjust import path

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SectionFeedback {
  title: string;
  feedback: string;
}

interface FeedbackResponse {
  summary: string;
  sectionFeedback: SectionFeedback[];
  tips: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [feedbackSections, setFeedbackSections] =
    useState<FeedbackResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyRecord[]>([]);
  const COHERE_API_KEY = Constants.expoConfig?.extra?.COHERE_API_KEY;

  useEffect(() => {
    const loadData = async () => {
      await cleanupOldRecords(); // Clean up old records when modal opens
      const data = await fetchWeeklyData(); // Fetch the past 7 days of data
      setWeeklyData(data);
    };

    if (visible) {
      loadData();
    }
  }, [visible]);

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
      Analyze the following goal completion data for a user and give critical and supportive feedback to improve the user's completion rates. Provide concise and personal feedback, including:

      1. A summary at the top.
      2. Detailed insights for each section, including completion rates and tips.
      3. General tips for improvement (3 to 5).

      Data:
      ${JSON.stringify(formattedData)}
      `;

      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command-r-plus-08-2024", // Use the appropriate model
          prompt: prompt,
          max_tokens: 500, // Increased token limit for more detailed feedback
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Parse the response into sections
      const parsedFeedback = parseFeedback(response.data.text);
      setFeedbackSections(parsedFeedback);
      console.log(parsedFeedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const parseFeedback = (feedbackText: string): FeedbackResponse => {
    const sections = feedbackText.split("\n\n"); // Split by double newlines
    const summary = sections[0]; // First section is the summary
    const sectionFeedback: SectionFeedback[] = sections
      .slice(1, -1)
      .map((section, index) => ({
        title: `Section ${index + 1}`,
        feedback: section,
      }));
    const tips = sections[sections.length - 1]; // Last section is general tips

    return {
      summary,
      sectionFeedback,
      tips,
    };
  };
  const logAllSections = async () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const sections = await getAllSections(today); // Pass the date to the function
    console.log("All Sections for today:", sections);
  };

  const logDailyRecords = async () => {
    const records = await getDailyRecords();
    console.log("Daily Records:", JSON.stringify(records, null, 2)); // Pretty print the records
  };

  const renderFeedback = () => {
    if (!feedbackSections) return null;

    return (
      <View>
        <Text style={styles.summaryText}>{feedbackSections.summary}</Text>
        {feedbackSections.sectionFeedback.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.feedback}</Text>
          </View>
        ))}
        <Text style={styles.tipsText}>{feedbackSections.tips}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Feedback</Text>
        <ScrollView style={styles.scrollView}>{renderFeedback()}</ScrollView>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitFeedback}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logButton} onPress={logAllSections}>
          <Text style={styles.logButtonText}>Log All Sections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logButton} onPress={logDailyRecords}>
          <Text style={styles.logButtonText}>Log Daily Records</Text>
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
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionText: {
    fontSize: 16,
  },
  tipsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
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
  logButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  logButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default FeedbackModal;
