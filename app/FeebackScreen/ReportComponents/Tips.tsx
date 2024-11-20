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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
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
