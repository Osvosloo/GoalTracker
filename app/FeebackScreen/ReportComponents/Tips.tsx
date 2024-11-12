import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TipsComponentProps {
  tips: string[];
}

const TipsComponent: React.FC<TipsComponentProps> = ({ tips }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>General Tips</Text>
      <Text style={styles.tips}>{tips}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#ffe0b2",
    borderRadius: 5,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tips: {
    fontSize: 14,
  },
});

export default TipsComponent;
