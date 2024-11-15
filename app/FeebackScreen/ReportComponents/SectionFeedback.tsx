import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface SectionFeedbackComponentProps {
  title: string;
  feedback: string;
  color: string;
}

const SectionFeedbackComponent: React.FC<SectionFeedbackComponentProps> = ({
  title,
  feedback,
  color,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      style={[
        styles.container,
        isExpanded ? styles.expanded : styles.collapsed,
      ]}
    >
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text
          style={styles.feedback}
          numberOfLines={isExpanded ? undefined : 2} // Show all lines when expanded, limit to 2 when collapsed
          ellipsizeMode="tail" // Show ellipsis at the end of the text when cut off
        >
          {feedback}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#121212",
    flex: 1,
    overflow: "hidden", // Prevent overflow if needed
  },
  expanded: {},
  collapsed: {
    height: 70, // Fixed height for the collapsed state
  },
  colorBar: {
    width: 10,
    height: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 15,
    marginTop: 5,
  },
  feedback: {
    color: "#fff",
    fontSize: 14,
    paddingBottom: 5,
  },
});

export default SectionFeedbackComponent;
