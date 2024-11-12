import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SummaryComponentProps {
  summary: string;
}

const SummaryComponent: React.FC<SummaryComponentProps> = ({ summary }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{summary}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SummaryComponent;
