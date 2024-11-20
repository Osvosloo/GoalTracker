import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SummaryComponentProps {
  summary: string;
  score: Score;
}

export type Score = "aweful" | "bad" | "moderate" | "great" | "amazing";

const getScoreColor = (score: Score) => {
  const colors: Record<Score, string> = {
    aweful: "#FF0000",
    bad: "#FF7F00",
    moderate: "#FFFF00",
    great: "#7FFF00",
    amazing: "#00FF00",
  };
  return colors[score];
};

const SummaryComponent: React.FC<SummaryComponentProps> = ({
  summary,
  score,
}) => {
  const scoreColor = getScoreColor(score);

  return (
    <View style={styles.gradientBorder}>
      <LinearGradient
        colors={["#121212", scoreColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score:</Text>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {score}
            </Text>
          </View>
          <Text style={styles.text}>{summary}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingBottom: 10,
  },
  gradient: {
    borderRadius: 5,
    padding: 5,
  },
  gradientBorder: {
    padding: 5,
    borderRadius: 5,
    overflow: "hidden",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 5,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SummaryComponent;
