import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Section, Goal } from "./types";
import Header from "./Header";
import DashboardManager from "./DashboardManager";

const ColorPicker = ({
  onColorSelect,
}: {
  onColorSelect: (color: string) => void;
}) => {
  const colors = [
    "#39FF14",
    "#FF3503",
    "#00FFE5",
    "#FF1493",
    "#8A2BE2",
    "#FE59C2",
  ];

  return (
    <View style={styles.colorPickerContainer}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.colorOption, { backgroundColor: color }]}
          onPress={() => onColorSelect(color)}
        />
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [sectionTitle, setSectionTitle] = useState("");
  const [activeSectionTitle, setActiveSectionTitle] = useState("");
  const sectionTitleInputRef = useRef<TextInput>(null);
  const [sectionColor, setSectionColor] = useState("#000000");
  const router = useRouter();

  useEffect(() => {
    loadSections();
    checkAndResetGoals();
    loadGoals();
  }, []);

  const loadSections = async () => {
    try {
      const storedSections = await AsyncStorage.getItem("sections");
      if (storedSections) {
        setSections(JSON.parse(storedSections));
      }
    } catch (error) {
      console.error("Failed to load sections:", error);
    }
  };

  const loadGoals = async () => {
    try {
      const storedGoals = await AsyncStorage.getItem("goals");
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  };

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      alert("Section title cannot be empty!");
      return;
    }

    // Check for unique title
    const existingSection = sections.find(
      (section) => section.title === sectionTitle
    );
    if (existingSection) {
      alert("Section title must be unique!");
      return;
    }

    const newSection: Section = {
      title: sectionTitle,
      color: sectionColor,
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    await saveSections(updatedSections);
    closeModal();
  };

  const handleUpdateSection = async () => {
    if (!sectionTitle.trim()) {
      alert("Section title cannot be empty!");
      return;
    }

    const existingSection = sections.find(
      (section) =>
        section.title === sectionTitle && section.title !== activeSectionTitle
    );
    if (existingSection) {
      alert("Section title must be unique!");
      return;
    }

    const updatedSections = sections.map((section) =>
      section.title === activeSectionTitle
        ? { ...section, title: sectionTitle, color: sectionColor }
        : section
    );
    setSections(updatedSections);
    await saveSections(updatedSections);
    closeModal();
  };

  const handleDelete = async (title: string) => {
    const updatedSections = sections.filter(
      (section) => section.title !== title
    );
    const updatedGoals = goals.filter((goal) => goal.sectionTitle !== title);

    setSections(updatedSections);
    setGoals(updatedGoals);
    await saveSections(updatedSections);
    await saveGoals(updatedGoals);
  };

  const saveSections = async (updatedSections: Section[]) => {
    try {
      await AsyncStorage.setItem("sections", JSON.stringify(updatedSections));
    } catch (error) {
      console.error("Failed to save sections:", error);
    }
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem("goals", JSON.stringify(updatedGoals));
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  };

  const checkAndResetGoals = async () => {
    const lastResetDate = await AsyncStorage.getItem("lastResetDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastResetDate !== today) {
      await DashboardManager.storeCompletedGoals();
      await DashboardManager.resetDailyGoals();
      await AsyncStorage.setItem("lastResetDate", today);
    }
  };
  const openModal = (type: "add" | "edit", title?: string) => {
    setModalType(type);
    if (type === "edit" && title) {
      const section = sections.find((s) => s.title === title);
      setActiveSectionTitle(section?.title || "");
      setSectionTitle(section?.title || "");
      setSectionColor(section?.color || "#000000");
    } else {
      setActiveSectionTitle("");
      setSectionTitle("");
      setSectionColor("#000000");
    }
    setModalVisible(true);
    setTimeout(() => {
      sectionTitleInputRef.current?.focus();
    }, 100);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSectionTitle("");
    setSectionColor("#000000");
  };

  const renderSectionItem = ({ item }: { item: Section }) => (
    <View style={[styles.sectionItemContainer, { borderColor: item.color }]}>
      <TouchableOpacity
        style={styles.sectionItem}
        onPress={() =>
          router.push(
            `/SectionScreen?title=${encodeURIComponent(
              item.title
            )}&color=${encodeURIComponent(item.color)}`
          )
        }
      >
        <Text style={styles.sectionTitle}>{item.title}</Text>
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => openModal("edit", item.title)}
          style={styles.editButton}
        >
          <MaterialIcons name="edit" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.title)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Header title="Goals" showDashboardButton={true} />
      </View>
      <FlatList
        style={{ marginTop: 75 }}
        data={sections}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.title} // Use title as unique key
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => openModal("add")}
      >
        <MaterialIcons name="add" size={24} color="#000000" />
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>
              {modalType === "add" ? "New Section" : "Edit Section"}
            </Text>
            <TextInput
              ref={sectionTitleInputRef}
              style={[
                styles.textInput,
                { borderColor: sectionColor, borderWidth: 1 },
              ]}
              placeholder="Enter section title"
              placeholderTextColor="#aaa"
              value={sectionTitle}
              onChangeText={setSectionTitle}
            />
            <Text style={styles.colorPickerLabel}>Choose section color:</Text>
            <ColorPicker onColorSelect={setSectionColor} />
            <View style={styles.selectedColorContainer}></View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={
                  modalType === "add" ? handleAddSection : handleUpdateSection
                }
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
    paddingTop: 10,
    // backgroundColor: "#7E57C2",
    // flex: 1,
  },
  sectionItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 15,
  },
  sectionItem: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
  },
  iconContainer: {
    flexDirection: "row",
  },
  editButton: {
    marginHorizontal: 5,
  },
  deleteButton: {
    marginHorizontal: 5,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#2c2c2c",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: "#3c3c3c",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  colorPickerLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  colorPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    marginTop: 5,
  },
  selectedColorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  selectedColorText: {
    color: "#fff",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButtonText: {
    color: "#007AFF",
    fontSize: 18,
  },
});
