import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SectionData } from "./types";

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  hasData: boolean;
  filteredData: SectionData[];
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
  hasData,
}) => {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    const generatePastWeekDates = () => {
      const dateArray: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dateArray.push(date.toISOString().split("T")[0]);
      }
      return dateArray; // Show oldest to newest
    };

    setDates(generatePastWeekDates());
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateString === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateButton,
              date === selectedDate && styles.selectedDateButton,
            ]}
            onPress={() => onDateChange(date)}
          >
            <Text
              style={[
                styles.dateButtonText,
                date === selectedDate && styles.selectedDateButtonText,
              ]}
            >
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {!hasData && selectedDate && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No data available for {formatDate(selectedDate)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#2c2c2c",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#3c3c3c",
  },
  selectedDateButton: {
    backgroundColor: "#7E57C2",
    borderColor: "#9575CD",
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedDateButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noDataContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    marginHorizontal: 16,
  },
  noDataText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
});

export default DateSelector;
