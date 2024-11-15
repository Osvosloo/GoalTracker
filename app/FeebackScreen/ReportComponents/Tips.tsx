import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface TipsComponentProps {
  tips: string[];
}

const TipsComponent: React.FC<TipsComponentProps> = ({ tips }) => {
  return (
    <View style={styles.gradientBorder}>
      <LinearGradient
        colors={["#7E57C2", "#121212"]}
        start={{ x: 0, y: 0 }} // Starting point of the gradient
        end={{ x: 1, y: 1 }} // Ending point of the gradient
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>General Tips</Text>
          {tips.map((tip, index) => (
            <Text key={index} style={styles.tips}>
              {tip}
            </Text>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#FFFFFF", // Solid background for the inner container
    borderRadius: 5, // Match the border radius with the gradient
  },
  gradient: {
    borderRadius: 5, // Ensure the gradient also has rounded corners
    padding: 5, // Add padding to create the appearance of a border
  },
  gradientBorder: {
    padding: 5, // Padding to create space for the gradient border
    borderRadius: 5,
    overflow: "hidden", // Ensures the gradient border follows the rounded corners
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tips: {
    fontSize: 14,
    marginVertical: 5,
  },
});

export default TipsComponent;
