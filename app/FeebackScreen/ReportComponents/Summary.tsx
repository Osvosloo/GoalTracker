import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SummaryComponentProps {
  summary: string;
  score: string;
}

const SummaryComponent: React.FC<SummaryComponentProps> = ({
  summary,
  score,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.text}>{summary}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#90EE90",
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  score: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000", // Adjust color for visibility
  },
});

export default SummaryComponent;
