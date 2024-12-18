import React, { useState, useEffect, useRef, startTransition } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Platform,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Section, Goal, DailyRecord, SectionData } from "./types";
import Header from "./Components/Header";
import DashboardManager from "./DashboardComp/DashboardManager";
import ColorPicker from "./HomeComp/ColorPicker";
import AddButton from "./UI/AddButton";
import {
  getAllSections,
  getDailyRecordByDate,
  getDailyRecords,
} from "@/scripts/getFromStorage";
import {
  populateMissingDailyRecords,
  updateExistingData,
  saveDailyCompletion,
  deepCopySections,
  STORAGE_KEYS,
} from "@/scripts/dataStructureManager";

export default function HomeScreen() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit">("add");
  const [sectionTitle, setSectionTitle] = useState("");
  const [activeSectionTitle, setActiveSectionTitle] = useState("");
  const sectionTitleInputRef = useRef<TextInput>(null);
  const [sectionColor, setSectionColor] = useState("#000000");
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    populateMissingDailyRecords();
    updateExistingData();
    loadSections();
    checkAndResetGoals();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
      saveDailyCompletion(sections);
      updateExistingData();
    }
  };

  const loadSections = async () => {
    try {
      console.log("Loading sections...");

      const dailyRecords = await getDailyRecords();

      let dailyRecord = (await getDailyRecordByDate(selectedDate)) || {
        date: selectedDate,
        sections: [],
      };

      // If no record for today, handle the case appropriately
      if (!dailyRecord) {
        console.log(`No record found for ${dailyRecord}.`);
        // Handle the case as needed, e.g., show a message or create a default record
      }

      await populateMissingDailyRecords();

      // // If no record for today, create one based on existing sections
      // if (!todayRecord) {
      //   console.log("No record found for today, creating a new one...");

      //   todayRecord = {
      //     date: formattedToday,
      //     sections: deepCopySections(sections),
      //   };

      //   // If sections are empty, handle the case appropriately
      //   if (todayRecord.sections.length === 0) {
      //     console.log(
      //       "Sections are empty. You may want to define how to handle this case."
      //     );
      //     todayRecord.sections = [];
      //     setSections(todayRecord.sections);
      //   }

      //   dailyRecords.push(todayRecord);
      //   console.log("Today's record created:", todayRecord);
      // }

      // Save updated records
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_RECORDS,
        JSON.stringify(dailyRecords)
      );
      // console.log("Daily records updated and saved:", dailyRecords);
      getDailyRecords();
      // Update the sections state
      setSections(dailyRecord.sections);
    } catch (error) {
      console.error("Failed to load sections:", error);
    }
  };

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      alert("Section title cannot be empty!");
      return;
    }
    const existingSection = sections.find(
      (section) => section.title === sectionTitle
    );
    if (existingSection) {
      alert("Section title must be unique!");
      return;
    }

    try {
      updateExistingData();
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      let dailyRecords: DailyRecord[] = recordsData
        ? JSON.parse(recordsData)
        : [];

      let currentDayRecord = dailyRecords.find(
        (record) => record.date === selectedDate
      );

      const newSection: SectionData = {
        title: sectionTitle,
        goals: [],
        totalScore: 0,
        completedScore: 0,
        color: sectionColor,
      };

      if (currentDayRecord) {
        currentDayRecord.sections = [...currentDayRecord.sections, newSection];
      } else {
        currentDayRecord = {
          date: selectedDate,
          sections: [newSection],
        };
        dailyRecords.push(currentDayRecord);
      }

      await AsyncStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));

      setSections(currentDayRecord.sections);
      closeModal();
    } catch (error) {
      console.error("Failed to add section:", error);
      alert("Failed to add section. Please try again.");
    }
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

    const updatedSections = sections.map((section) => {
      if (section.title === activeSectionTitle) {
        return {
          ...section,
          title: sectionTitle,
          color: sectionColor,
          goals: section.goals,
        };
      }
      return section;
    });
    console.log("Updated Sections:", updatedSections);
    await saveSections(updatedSections);
    setSections(updatedSections);
    updateExistingData();
    closeModal();
  };

  const handleDelete = async (title: string) => {
    const updatedSections = sections.filter(
      (section) => section.title !== title
    );
    await saveSections(updatedSections);
    setSections(updatedSections);
    updateExistingData();
  };

  const saveSections = async (updatedSections: SectionData[]) => {
    try {
      const recordsData = await AsyncStorage.getItem("dailyRecords");
      let dailyRecords: DailyRecord[] = recordsData
        ? JSON.parse(recordsData)
        : [];

      const dailyRecordIndex = dailyRecords.findIndex(
        (record) => record.date === selectedDate
      );

      if (dailyRecordIndex !== -1) {
        dailyRecords[dailyRecordIndex].sections =
          deepCopySections(updatedSections);
      } else {
        dailyRecords.push({
          date: selectedDate,
          sections: deepCopySections(updatedSections),
        });
      }

      await AsyncStorage.setItem("dailyRecords", JSON.stringify(dailyRecords));
    } catch (error) {
      console.error("Failed to save sections:", error);
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
      startTransition(() => setActiveSectionTitle(section?.title || ""));
      startTransition(() => setSectionTitle(section?.title || ""));
      startTransition(() => setSectionColor(section?.color || "#000000"));
    } else {
      startTransition(() => setActiveSectionTitle(""));
      startTransition(() => setSectionTitle(""));
      startTransition(() => setSectionColor("#000000"));
    }
    startTransition(() => setModalVisible(true));

    setTimeout(() => {
      sectionTitleInputRef.current?.focus();
    }, 100);
  };

  const closeModal = () => {
    startTransition(() => setModalVisible(false));
    startTransition(() => setSectionTitle(""));
    startTransition(() => setSectionColor("#000000"));
  };

  const handleSectionPress = async (sectionTitle: string, color: string) => {
    try {
      const sectionData = await DashboardManager.loadSectionData(
        selectedDate,
        sectionTitle
      );
      if (sectionData) {
        router.push({
          pathname: "/SectionScreen",
          params: {
            title: sectionTitle,
            color: color,
            date: selectedDate,
            goalsData: JSON.stringify(sectionData.goals),
          },
        });
      } else {
        console.error(
          "No section data found for:",
          sectionTitle,
          "on date:",
          selectedDate
        );
        alert(
          `No section data found for "${sectionTitle}" on date: ${selectedDate}`
        );
      }
    } catch (error) {
      console.error("Error navigating to section:", error);
    }
  };

  const renderSectionItem = ({ item }: { item: SectionData }) => (
    <View style={[styles.sectionItemContainer, { borderColor: item.color }]}>
      <TouchableOpacity
        style={styles.sectionItem}
        onPress={() => handleSectionPress(item.title, item.color)}
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
        style={{ marginTop: Platform.OS === "web" ? 0 : 95 }}
        data={sections}
        renderItem={renderSectionItem}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
      />
      <AddButton
        onPress={() => openModal("add")}
        tooltipText="Add a new Section"
      />
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
    color: "#fff",
    fontSize: 18,
  },
});
