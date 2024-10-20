import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Goal } from "./types";
import Header from "./Header";

export default function SectionScreen() {
  const params = useLocalSearchParams();
  const title = Array.isArray(params.title)
    ? params.title[0]
    : params.title || "";
  const color = Array.isArray(params.color)
    ? params.color[0]
    : params.color || "#000000";
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [goalName, setGoalName] = useState("");
  const [goalScore, setGoalScore] = useState(1);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>(""); // Changed to sectionTitle

  useEffect(() => {
    const initializeSection = async () => {
      const titleParam = Array.isArray(params.title)
        ? params.title[0]
        : params.title;
      setSectionTitle(titleParam || ""); // Set section title
    };
    initializeSection();
  }, [params.title]);

  useEffect(() => {
    if (sectionTitle) {
      loadGoals();
    }
  }, [sectionTitle]);

  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem("goals");
      if (storedGoals) {
        const allGoals: Goal[] = JSON.parse(storedGoals);
        const sectionGoals = allGoals.filter(
          (goal) => goal.sectionTitle === sectionTitle // Use sectionTitle for filtering
        );
        setGoals(sectionGoals);
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  };

  const handleAddGoal = async () => {
    if (!goalName.trim()) {
      alert("Goal name cannot be empty!");
      return;
    }
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalName,
      score: goalScore,
      completed: false,
      sectionTitle: sectionTitle,
      creationDate: new Date(),
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    closeModal();
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      const storedGoals = await AsyncStorage.getItem("goals");
      let allGoals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

      allGoals = allGoals.filter((goal) => goal.sectionTitle !== sectionTitle); // Use sectionTitle for filtering
      allGoals = [...allGoals, ...updatedGoals];

      await AsyncStorage.setItem("goals", JSON.stringify(allGoals));
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  };

  const handleUpdateGoal = async () => {
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
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    setActiveGoal(null);
  };

  const handleToggleGoal = async (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
  };

  const openModal = (type: "add" | "edit", id?: string) => {
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
        {activeGoal === item.id ? (
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
      <View style={styles.topBar}>
        <Header title={title} showDashboardButton={true} />
      </View>

      <FlatList
        style={{ marginTop: 80 }}
        contentContainerStyle={styles.listContainer}
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => openModal("add")}
      >
        <MaterialIcons name="add" size={24} color="#000" />
      </TouchableOpacity>

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
    marginTop: 20,
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
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
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
});
