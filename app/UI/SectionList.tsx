import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { SectionData } from "../types";

interface SectionListProps {
  filteredData: SectionData[];
  isHistorical: boolean;
  selectedDate: string;
}

const SectionList: React.FC<SectionListProps> = ({
  filteredData,
  isHistorical,
  selectedDate,
}) => {
  const router = useRouter();

  const handleSectionPress = (section: SectionData) => {
    router.push(
      `/SectionScreen?title=${encodeURIComponent(
        section.title
      )}&color=${encodeURIComponent(
        section.color
      )}&isHistorical=${isHistorical}&date=${encodeURIComponent(selectedDate)}` // Pass the selected date
    );
  };

  return (
    <FlatList
      data={filteredData}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleSectionPress(item)}
          style={styles.legendItem}
        >
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.title}</Text>
          <Text style={styles.legendScore}>
            {item.totalScore > 0
              ? `${Number(item.completedScore)}/${Number(item.totalScore)}`
              : "No Goals"}
          </Text>
          <Text style={styles.legendScore}>
            {item.totalScore > 0
              ? `${((item.completedScore / item.totalScore) * 100).toFixed(0)}%`
              : "0%"}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.title}
    />
  );
};

const styles = StyleSheet.create({
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
    marginHorizontal: 20,
    paddingVertical: 5,
  },
  legendColor: {
    width: 10,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  legendScore: {
    color: "#fff",
    fontSize: 16,
    width: 60,
    textAlign: "right",
  },
});

export default SectionList;
