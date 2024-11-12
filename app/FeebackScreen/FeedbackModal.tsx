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
import SummaryComponent from "./ReportComponents/Summary";
import SectionFeedbackComponent from "./ReportComponents/SectionFeedback";
import TipsComponent from "./ReportComponents/Tips";

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
  tips: string[];
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
      console.log("Loading response");

      const formattedData = weeklyData.map((record) => ({
        date: record.date,
        sections: record.sections.map((section) => ({
          title: section.title,
          totalScore: section.totalScore,
          completedScore: section.completedScore,
          goalsCompleted: section.goals.filter((goal) => goal.completed).length,
          totalGoals: section.goals.length,
          goals: section.goals.map((goal) => ({
            title: goal.title,
            completed: goal.completed,
            score: goal.score,
          })),
        })),
      }));
      const fdata = JSON.stringify(formattedData);
      console.log(`new data  \n ${fdata}`);

      const prompt = `
      Analyze the following goal completion data for a user and provide structured feedback in JSON format to improve the user's completion rates. Your response should include the following fields:
      
      1. **summary**: A brief overview of the user's performance, highlighting key metrics and overall trends.
      
      2. **sectionFeedback**: An array of objects, each containing:
         - **title**: The title of the section (as given in the data).
         - **feedback**: A brief analysis of the completion rate, including specific metrics (e.g., "You completed X out of Y goals") and constructive feedback on how to improve in that section.
      
      3. **generalTips**: An array of actionable tips for improvement, formatted as a list.
      
      **Important**: Ensure that the JSON is properly formatted and does not include any unnecessary titles or labels. The output should be valid JSON.
      Note also that this is for a goal tracking app, and thus you should use the section and goal titles to give relevant feedback. 
      
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
    // Parse the JSON response
    const feedbackData = JSON.parse(feedbackText);

    // Extract the relevant fields
    const summary = feedbackData.summary;
    const sectionFeedback: SectionFeedback[] = feedbackData.sectionFeedback;
    const tips: string[] = feedbackData.generalTips;

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
        <SummaryComponent summary={feedbackSections.summary} />
        {feedbackSections.sectionFeedback.map((section, index) => (
          <SectionFeedbackComponent
            key={index}
            title={section.title}
            feedback={section.feedback}
          />
        ))}
        <TipsComponent tips={feedbackSections.tips} />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>{renderFeedback()}</ScrollView>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitFeedback}
        >
          <Text style={styles.submitButtonText}>Get Feedback</Text>
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

    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    maxHeight: 600,
  },
  submitButton: {
    marginTop: 15,
    backgroundColor: "#7E57C2",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  closeButton: {
    backgroundColor: "#121212",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderColor: "#121212",
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default FeedbackModal;
