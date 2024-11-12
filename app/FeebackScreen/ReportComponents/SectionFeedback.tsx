import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionFeedbackComponentProps {
  title: string;
  feedback: string;
}

const SectionFeedbackComponent: React.FC<SectionFeedbackComponentProps> = ({
  title,
  feedback,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.feedback}>{feedback}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#FF7F00",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  feedback: {
    fontSize: 14,
  },
});

export default SectionFeedbackComponent;
