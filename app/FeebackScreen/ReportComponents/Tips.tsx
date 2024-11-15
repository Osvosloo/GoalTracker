import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface TipsComponentProps {
  tips: string[];
}

const TipsComponent: React.FC<TipsComponentProps> = ({ tips }) => {
  return (
    <LinearGradient
      colors={["#7E57C2", "#FF4081"]}
      style={styles.gradientBorder}
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    // backgroundColor: "#7E57C2",
    borderColor: "#7E57C2",
    borderWidth: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  gradientBorder: {
    padding: 5,
    borderRadius: 5,
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
