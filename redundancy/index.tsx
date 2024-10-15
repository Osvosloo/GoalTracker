// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   Modal,
//   TextInput,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { MaterialIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// interface Section {
//   id: number;
//   title: string;
//   color: string;
// }
// interface Goal {
//   id: string;
//   name: string;
//   score: number;
//   completed: boolean;
//   sectionId: number;
// }

// const ColorPicker = ({
//   onColorSelect,
// }: {
//   onColorSelect: (color: string) => void;
// }) => {
//   const colors = [
//     "#FF6B6B",
//     "#4ECDC4",
//     "#45B7D1",
//     "#FFA07A",
//     "#98D8C8",
//     "#F06292",
//   ];

//   return (
//     <View style={styles.colorPickerContainer}>
//       {colors.map((color) => (
//         <TouchableOpacity
//           key={color}
//           style={[styles.colorOption, { backgroundColor: color }]}
//           onPress={() => onColorSelect(color)}
//         />
//       ))}
//     </View>
//   );
// };

// export default function HomeScreen() {
//   const [sections, setSections] = useState<Section[]>([]);
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState<"add" | "edit">("add");
//   const [sectionTitle, setSectionTitle] = useState("");
//   const [sectionColor, setSectionColor] = useState("#000000");
//   const [editSectionId, setEditSectionId] = useState<number | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     loadSections();
//     loadGoals();
//   }, []);

//   const loadSections = async () => {
//     try {
//       const storedSections = await AsyncStorage.getItem("sections");
//       if (storedSections) {
//         setSections(JSON.parse(storedSections));
//       }
//     } catch (error) {
//       console.error("Failed to load sections:", error);
//     }
//   };
//   const loadGoals = async () => {
//     try {
//       const storedGoals = await AsyncStorage.getItem("goals");
//       if (storedGoals) {
//         setGoals(JSON.parse(storedGoals));
//       }
//     } catch (error) {
//       console.error("Failed to load goals:", error);
//     }
//   };

//   const handleAddSection = async () => {
//     if (!sectionTitle.trim()) {
//       alert("Section title cannot be empty!");
//       return;
//     }
//     const newSection: Section = {
//       id: sections.length + 1,
//       title: sectionTitle,
//       color: sectionColor,
//     };
//     const updatedSections = [...sections, newSection];
//     setSections(updatedSections);
//     await saveSections(updatedSections);
//     closeModal();
//   };

//   const handleUpdateSection = async () => {
//     if (!sectionTitle.trim()) {
//       alert("Section title cannot be empty!");
//       return;
//     }
//     const updatedSections = sections.map((section) =>
//       section.id === editSectionId
//         ? { ...section, title: sectionTitle, color: sectionColor }
//         : section
//     );
//     setSections(updatedSections);
//     await saveSections(updatedSections);
//     closeModal();
//   };

//   const handleDelete = async (id: number) => {
//     const updatedSections = sections.filter((section) => section.id !== id);
//     const updatedGoals = goals.filter((goal) => goal.sectionId !== id);

//     setSections(updatedSections);
//     setGoals(updatedGoals);
//     await saveSections(updatedSections);
//     await saveGoals(updatedGoals);
//   };

//   const saveSections = async (updatedSections: Section[]) => {
//     try {
//       await AsyncStorage.setItem("sections", JSON.stringify(updatedSections));
//     } catch (error) {
//       console.error("Failed to save sections:", error);
//     }
//   };
//   const saveGoals = async (updatedGoals: Goal[]) => {
//     try {
//       await AsyncStorage.setItem("goals", JSON.stringify(updatedGoals));
//     } catch (error) {
//       console.error("Failed to save goals:", error);
//     }
//   };

//   const openModal = (type: "add" | "edit", id?: number) => {
//     setModalType(type);
//     if (type === "edit" && id) {
//       const section = sections.find((s) => s.id === id);
//       setSectionTitle(section?.title || "");
//       setSectionColor(section?.color || "000000");
//       setEditSectionId(id);
//     } else {
//       setSectionTitle("");
//       setSectionColor("#000000");
//       setEditSectionId(null);
//     }
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setSectionTitle("");
//     setSectionColor("#000000");
//     setEditSectionId(null);
//   };

//   const navigateToDashboard = () => {
//     router.push("/DashboardScreen");
//   };

//   const renderSectionItem = ({ item }: { item: Section }) => (
//     <View style={[styles.sectionItemContainer, { borderColor: item.color }]}>
//       <TouchableOpacity
//         style={styles.sectionItem}
//         onPress={() =>
//           router.push(
//             `/SectionScreen?id=${item.id}&title=${encodeURIComponent(
//               item.title
//             )}&color=${encodeURIComponent(item.color)}`
//           )
//         }
//       >
//         <Text style={styles.sectionTitle}>{item.title}</Text>
//       </TouchableOpacity>
//       <View style={styles.iconContainer}>
//         <TouchableOpacity onPress={() => openModal("edit", item.id)}>
//           <MaterialIcons name="edit" size={24} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => handleDelete(item.id)}>
//           <MaterialIcons name="delete" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.topBar}>
//         <TouchableOpacity style={styles.burgerMenu}>
//           <MaterialIcons name="menu" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.header}>Goals</Text>
//         <TouchableOpacity
//           style={styles.dashboardButton}
//           onPress={navigateToDashboard}
//         >
//           <MaterialIcons name="dashboard" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={sections}
//         renderItem={renderSectionItem}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.listContainer}
//       />
//       <TouchableOpacity
//         style={styles.floatingButton}
//         onPress={() => openModal("add")}
//       >
//         <MaterialIcons name="add" size={24} color="#fff" />
//       </TouchableOpacity>

//       <Modal transparent={true} visible={modalVisible} animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalHeader}>
//               {modalType === "add" ? "New Section" : "Edit Section"}
//             </Text>
//             <TextInput
//               style={[
//                 styles.textInput,
//                 { borderColor: sectionColor, borderWidth: 2 },
//               ]}
//               placeholder="Enter section title"
//               placeholderTextColor="#aaa"
//               value={sectionTitle}
//               onChangeText={setSectionTitle}
//             />
//             <Text style={styles.colorPickerLabel}>Choose section color:</Text>
//             <ColorPicker onColorSelect={setSectionColor} />
//             <View style={styles.selectedColorContainer}></View>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 onPress={
//                   modalType === "add" ? handleAddSection : handleUpdateSection
//                 }
//               >
//                 <Text style={styles.modalButtonText}>
//                   {modalType === "add" ? "Add" : "Update"}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={closeModal}>
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#1e1e1e",
//     paddingTop: StatusBar.currentHeight,
//   },
//   topBar: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     // marginBottom: 5,
//   },
//   listContainer: {
//     paddingHorizontal: 20,
//   },
//   sectionItemContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#2c2c2c",
//     borderRadius: 10,
//     borderWidth: 2,
//     marginBottom: 10,
//     padding: 15,
//   },
//   sectionItem: {
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     color: "#fff",
//   },
//   iconContainer: {
//     flexDirection: "row",
//   },
//   burgerMenu: {
//     padding: 5,
//   },
//   dashboardButton: {
//     padding: 10,
//   },
//   floatingButton: {
//     position: "absolute",
//     right: 20,
//     bottom: 20,
//     backgroundColor: "#007AFF",
//     borderRadius: 30,
//     width: 60,
//     height: 60,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "#2c2c2c",
//     padding: 20,
//     borderRadius: 10,
//     width: "80%",
//   },
//   modalHeader: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 20,
//   },
//   textInput: {
//     backgroundColor: "#3c3c3c",
//     color: "#fff",
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   colorPickerLabel: {
//     fontSize: 16,
//     color: "#fff",
//     marginBottom: 10,
//   },
//   colorPickerContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   colorOption: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginBottom: 5,
//     marginTop: 5,
//   },
//   selectedColorContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   selectedColor: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     marginRight: 10,
//   },
//   selectedColorText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalButtonText: {
//     color: "#007AFF",
//     fontSize: 18,
//   },
// });
