import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
import SummaryComponent, { Score } from "./ReportComponents/Summary";
import SectionFeedbackComponent from "./ReportComponents/SectionFeedback";
import TipsComponent from "./ReportComponents/Tips";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SectionFeedback {
  title: string;
  feedback: string;
  color: string;
}

interface FeedbackResponse {
  summary: string;
  score: Score;
  sectionFeedback: SectionFeedback[];
  tips: string[];
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const [feedbackSections, setFeedbackSections] =
    useState<FeedbackResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
          color: section.color,
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
      Analyze the following goal completion data for me and provide structured feedback in JSON format to improve my completion rates. Your response should include the following fields:
      
      1. **summary**: A brief overview of the my performance, highlighting key metrics and overall trends.
      
      2. **score**: A performance score indicating my completion rate (options: aweful, bad, moderate, great, amazing).
      
      3. **sectionFeedback**: An array of objects, each containing:
         - **title**: The title of the section (as given in the data).
         - **feedback**: A brief analysis of the completion rate, including specific metrics (e.g., "You completed X out of Y goals") and constructive feedback on how to improve in that section.
         - **color**: The color code (e.g., "#FF5733") representing the sections' color.
      
      4. **generalTips**: An array of actionable tips for improvement, formatted as a list and tailored to my specific needs.
      
      **Important**: Ensure that the JSON is properly formatted and does not include any unnecessary titles or labels. The output should be valid JSON.
      Note also that this is for a goal tracking app, and thus you should use the section and goal titles to give relevant feedback, and if a .
      
      Data:
      ${JSON.stringify(formattedData)}
      `;

      const response = await axios.post(
        "https://api.cohere.ai/generate",
        {
          model: "command-r-plus-08-2024", // Use the appropriate model
          prompt: prompt,
          max_tokens: 1000, // Increased token limit for more detailed feedback
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
    } finally {
      setLoading(false);
    }
  };

  const parseFeedback = (feedbackText: string): FeedbackResponse | null => {
    if (!feedbackText) {
      console.error("Empty feedback text received");
      return null;
    }

    console.log("Received feedback:", feedbackText);
    try {
      const feedbackData = JSON.parse(feedbackText);

      const summary = feedbackData.summary;
      const score: Score = feedbackData.score;
      const sectionFeedback: SectionFeedback[] =
        feedbackData.sectionFeedback.map((section: any) => ({
          title: section.title,
          feedback: section.feedback,
          color: section.color,
        }));
      const tips: string[] = feedbackData.generalTips;

      return {
        summary,
        score,
        sectionFeedback,
        tips,
      };
    } catch (error) {
      console.error("Error parsing feedback response:", error);
      return null;
    }
  };

  const renderFeedback = () => {
    if (!feedbackSections) return null;

    return (
      <View>
        <SummaryComponent
          summary={feedbackSections.summary}
          score={feedbackSections.score}
        />
        <Text style={styles.subHeader}>Section Specific Feedback</Text>
        {feedbackSections.sectionFeedback.map((section, index) => (
          <SectionFeedbackComponent
            key={index}
            title={section.title}
            feedback={section.feedback}
            color={section.color}
          />
        ))}
        <TipsComponent tips={feedbackSections.tips} />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.header}>User Feedback</Text>
        <ScrollView style={styles.scrollView}>
          {loading ? (
            <ActivityIndicator size="large" color="#7E57C2" />
          ) : (
            renderFeedback()
          )}
        </ScrollView>
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
    // backgroundColor: "#",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    maxHeight: 600,
    borderWidth: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
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
  gradient: {
    flex: 1,
  },
});

export default FeedbackModal;
