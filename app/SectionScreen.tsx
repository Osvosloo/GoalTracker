import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Goal, DailyRecord } from "./types";
import Header from "./Components/Header";
import AddButton from "./UI/AddButton";
// import DashboardManager from "./DashboardComp/DashboardManager";

export default function SectionScreen() {
  const params = useLocalSearchParams();
  const title = Array.isArray(params.title)
    ? params.title[0]
    : params.title || "";
  const color = Array.isArray(params.color)
    ? params.color[0]
    : params.color || "#000000";
  const dateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const isHistoricalView = params.isHistorical === "true";

  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [goalName, setGoalName] = useState("");
  const [goalScore, setGoalScore] = useState(1);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>(""); // Changed to sectionTitle
  const [selectedDate, setSelectedDate] = useState<string>(
    dateParam || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const initializeSection = async () => {
      setSectionTitle(title);
      loadGoals();
    };
    initializeSection();
  }, [title]);

  useEffect(() => {
    if (sectionTitle) {
      loadGoals();
    }
  }, [sectionTitle, selectedDate]);

  const loadGoals = async () => {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      if (recordsData) {
        const dailyRecords: DailyRecord[] = JSON.parse(recordsData);
        const dailyRecord = dailyRecords.find(
          (record) => record.date === selectedDate
        );

        if (dailyRecord) {
          const sectionData = dailyRecord.sections.find(
            (section) => section.title === sectionTitle
          );
          if (sectionData) {
            console.log("Goals loaded:", sectionData.goals);
            setGoals(sectionData.goals || []);
            return;
          }
        }
      }
      setGoals([]);
    } catch (error) {
      console.error("Failed to load goals:", error);
      Alert.alert("Error", "Failed to load goals");
    }
  };

  const handleAddGoal = async () => {
    if (isHistoricalView) {
      console.log("history");
      Alert.alert("Notice", "Cannot add goals to past dates");
      return;
    }
    if (!goalName.trim()) {
      alert("Goal name cannot be empty!");
      return;
    }
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalName.trim(),
      score: goalScore,
      completed: false,
      sectionTitle: sectionTitle,
      creationDate: new Date(),
    };
    try {
      const updatedGoals = [...goals, newGoal];
      await saveGoals(updatedGoals);
      setGoals(updatedGoals);
      closeModal();
    } catch (error) {
      console.error("Failed to add goal:", error);
      Alert.alert("Error", "Failed to add goal");
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      let dailyRecords: DailyRecord[] = recordsData
        ? JSON.parse(recordsData)
        : [];

      const recordIndex = dailyRecords.findIndex(
        (record) => record.date === selectedDate
      );

      if (recordIndex !== -1) {
        const sectionIndex = dailyRecords[recordIndex].sections.findIndex(
          (section) => section.title === sectionTitle // Use the current section title
        );

        if (sectionIndex !== -1) {
          // Update the existing section with the new title and color
          dailyRecords[recordIndex].sections[sectionIndex] = {
            ...dailyRecords[recordIndex].sections[sectionIndex],
            title: sectionTitle, // Use the updated title
            color: color, // Use the updated color
            goals: updatedGoals,
            totalScore: calculateTotalScore(updatedGoals),
            completedScore: calculateCompletedScore(updatedGoals),
          };
        } else {
          // If the section is not found, add a new one with the new title and color
          dailyRecords[recordIndex].sections.push({
            title: sectionTitle,
            color,
            goals: updatedGoals,
            totalScore: calculateTotalScore(updatedGoals),
            completedScore: calculateCompletedScore(updatedGoals),
          });
        }
      } else {
        // If the record for the selected date is not found, create a new one
        dailyRecords.push({
          date: selectedDate,
          sections: [
            {
              title: sectionTitle,
              color,
              goals: updatedGoals,
              totalScore: calculateTotalScore(updatedGoals),
              completedScore: calculateCompletedScore(updatedGoals),
            },
          ],
        });
      }

      await AsyncStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));
    } catch (error) {
      console.error("Failed to save goals:", error);
      throw error;
    }
  };
  const calculateTotalScore = (goals: Goal[]): number => {
    return goals.reduce((total, goal) => total + goal.score, 0);
  };
  const calculateCompletedScore = (goals: Goal[]): number => {
    return goals.reduce(
      (total, goal) => (goal.completed ? total + goal.score : total),
      0
    );
  };

  const handleUpdateGoal = async () => {
    console.log("updated");
    if (isHistoricalView) {
      console.log("cant update");
      Alert.alert("Notice", "Cannot edit goals for past dates");
      return;
    }
    if (!goalName.trim()) {
      alert("Goal name cannot be empty!");
      return;
    }
    const updatedGoals = goals.map((goal) =>
      goal.id === editGoalId
        ? { ...goal, name: goalName, score: goalScore }
        : goal
    );
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    closeModal();
  };

  const handleDeleteGoal = async (id: string) => {
    if (isHistoricalView) {
      Alert.alert("Notice", "Cannot delete goals for past dates");
      return;
    }
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    setActiveGoal(null);
  };

  const handleToggleGoal = async (id: string) => {
    if (isHistoricalView) {
      return;
    }
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
  };

  const openModal = (type: "add" | "edit", id?: string) => {
    if (isHistoricalView) {
      console.log("is history");
      alert("gg");
      return;
    }
    setModalType(type);
    if (type === "edit" && id) {
      const goal = goals.find((g) => g.id === id);
      setGoalName(goal?.name || "");
      setGoalScore(goal?.score || 1);
      setEditGoalId(id);
    } else {
      setGoalName("");
      setGoalScore(1);
      setEditGoalId(null);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType("add");
    setGoalName("");
    setGoalScore(1);
    setEditGoalId(null);
    setActiveGoal(null);
  };

  const getScoreColor = (score: number) => {
    const colors = ["#00FF00", "#7FFF00", "#FFFF00", "#FF7F00", "#FF0000"];
    return colors[score - 1];
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <View style={styles.goalItemContainer}>
      <TouchableOpacity
        style={styles.goalItem}
        onPress={() => handleToggleGoal(item.id)}
      >
        <View
          style={[
            styles.scoreIndicator,
            { backgroundColor: getScoreColor(item.score) },
          ]}
        >
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
        <Text style={[styles.goalName, item.completed && styles.completedGoal]}>
          {item.name}
        </Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        {!isHistoricalView && activeGoal === item.id ? (
          <>
            <TouchableOpacity
              onPress={() => openModal("edit", item.id)}
              style={styles.iconButton}
            >
              <MaterialIcons name="edit" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteGoal(item.id)}
              style={styles.iconButton}
            >
              <MaterialIcons name="delete" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveGoal(null)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setActiveGoal(item.id)}
          >
            <MaterialIcons name="more-vert" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          { marginBottom: Platform.OS === "web" ? 0 : 95 },
        ]}
      >
        <Header
          title={`${title} ${isHistoricalView ? "(Historical)" : ""}`}
          showDashboardButton={true}
        />
      </View>
      {isHistoricalView && (
        <View style={styles.historicalBanner}>
          <Text style={styles.historicalText}>
            Viewing goals for {selectedDate}
          </Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
      />
      {!isHistoricalView && (
        <AddButton
          onPress={() => openModal("add")}
          tooltipText="Add a new Goal"
        />
      )}
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {modalType === "add" ? "New Goal" : "Edit Goal"}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter goal name"
              placeholderTextColor="#aaa"
              value={goalName}
              onChangeText={setGoalName}
            />
            <Text style={styles.pickerLabel}>Goal Necessity Score:</Text>
            <Picker
              selectedValue={goalScore}
              style={styles.picker}
              onValueChange={(itemValue) => setGoalScore(itemValue)}
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <Picker.Item
                  key={score}
                  label={score.toString()}
                  value={score}
                />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={modalType === "add" ? handleAddGoal : handleUpdateGoal}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === "add" ? "Add" : "Update"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    // flex: 1,
    // backgroundColor: "#7E57C2",
  },
  goalItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 5,
    padding: 15,
  },
  goalItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  goalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    // flex: 1,
    marginLeft: 10,
  },
  completedGoal: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  scoreIndicator: {
    width: 18,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    color: "#000000",
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: 90,
  },
  iconButton: {
    padding: 3,
  },
  closeButton: {
    padding: 5,
    marginLeft: "auto", // Push close button to the right
  },
  menuButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 5,
  },
  modalHeader: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: "#000",
  },
  pickerLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonText: {
    fontSize: 18,
    color: "#fff",
    padding: 10,
  },

  dashboardButton: {
    padding: 10,
  },
  historicalBanner: {
    backgroundColor: "#2c2c2c",
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 5,
  },
  historicalText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
});
