// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   Modal,
//   TextInput,
// } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import { useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// interface Goal {
//   id: string;
//   name: string;
//   score: number;
//   completed: boolean;
//   sectionId: number;
// }

// export default function SectionScreen() {
//   const params = useLocalSearchParams();
//   const title = Array.isArray(params.title)
//     ? params.title[0]
//     : params.title || "";
//   const color = Array.isArray(params.color)
//     ? params.color[0]
//     : params.color || "#000000";
//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState<"add" | "edit">("add");
//   const [goalName, setGoalName] = useState("");
//   const [goalScore, setGoalScore] = useState(1);
//   const [editGoalId, setEditGoalId] = useState<string | null>(null);
//   const [activeGoal, setActiveGoal] = useState<string | null>(null);
//   const [sectionId, setSectionId] = useState<number>(0);

//   useEffect(() => {
//     const initializeSection = async () => {
//       const id = Array.isArray(params.id) ? params.id[0] : params.id;
//       const parsedId = parseInt(id || "0", 10);
//       setSectionId(parsedId);
//     };
//     initializeSection();
//   }, [params.id]);

//   useEffect(() => {
//     if (sectionId !== 0) {
//       loadGoals();
//     }
//   }, [sectionId]);

//   const loadGoals = async () => {
//     try {
//       const storedGoals = await AsyncStorage.getItem("goals");
//       if (storedGoals) {
//         const allGoals: Goal[] = JSON.parse(storedGoals);
//         const sectionGoals = allGoals.filter(
//           (goal) => goal.sectionId === sectionId
//         );
//         setGoals(sectionGoals);
//       }
//     } catch (error) {
//       console.error("Failed to load goals:", error);
//     }
//   };

//   const handleAddGoal = async () => {
//     if (!goalName.trim()) {
//       alert("Goal name cannot be empty!");
//       return;
//     }
//     const newGoal: Goal = {
//       id: Date.now().toString(),
//       name: goalName,
//       score: goalScore,
//       completed: false,
//       sectionId: sectionId,
//     };
//     const updatedGoals = [...goals, newGoal];
//     setGoals(updatedGoals);
//     await saveGoals(updatedGoals);
//     closeModal();
//   };

//   const saveGoals = async (updatedGoals: Goal[]) => {
//     try {
//       const storedGoals = await AsyncStorage.getItem("goals");
//       let allGoals: Goal[] = storedGoals ? JSON.parse(storedGoals) : [];

//       allGoals = allGoals.filter((goal) => goal.sectionId !== sectionId);
//       allGoals = [...allGoals, ...updatedGoals];

//       await AsyncStorage.setItem("goals", JSON.stringify(allGoals));
//     } catch (error) {
//       console.error("Failed to save goals:", error);
//     }
//   };

//   const handleUpdateGoal = async () => {
//     if (!goalName.trim()) {
//       alert("Goal name cannot be empty!");
//       return;
//     }
//     const updatedGoals = goals.map((goal) =>
//       goal.id === editGoalId
//         ? { ...goal, name: goalName, score: goalScore }
//         : goal
//     );
//     setGoals(updatedGoals);
//     await saveGoals(updatedGoals);
//     closeModal();
//   };

//   const handleDeleteGoal = async (id: string) => {
//     const updatedGoals = goals.filter((goal) => goal.id !== id);
//     setGoals(updatedGoals);
//     await saveGoals(updatedGoals);
//     setActiveGoal(null);
//   };

//   const handleToggleGoal = async (id: string) => {
//     const updatedGoals = goals.map((goal) =>
//       goal.id === id ? { ...goal, completed: !goal.completed } : goal
//     );
//     setGoals(updatedGoals);
//     await saveGoals(updatedGoals);
//   };

//   const openModal = (type: "add" | "edit", id?: string) => {
//     setModalType(type);
//     if (type === "edit" && id) {
//       const goal = goals.find((g) => g.id === id);
//       setGoalName(goal?.name || "");
//       setGoalScore(goal?.score || 1);
//       setEditGoalId(id);
//     } else {
//       setGoalName("");
//       setGoalScore(1);
//       setEditGoalId(null);
//     }
//     setModalVisible(true);
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setGoalName("");
//     setGoalScore(1);
//     setEditGoalId(null);
//     setActiveGoal(null);
//   };

//   const getScoreColor = (score: number) => {
//     const colors = ["#4CAF50", "#8BC34A", "#FFEB3B", "#FF9800", "#F44336"];
//     return colors[score - 1];
//   };

//   const renderGoalItem = ({ item }: { item: Goal }) => (
//     <View style={styles.goalItemContainer}>
//       <TouchableOpacity
//         style={styles.goalItem}
//         onPress={() => handleToggleGoal(item.id)}
//       >
//         <View
//           style={[
//             styles.scoreIndicator,
//             { backgroundColor: getScoreColor(item.score) },
//           ]}
//         >
//           <Text style={styles.scoreText}>{item.score}</Text>
//         </View>
//         <Text style={[styles.goalName, item.completed && styles.completedGoal]}>
//           {item.name}
//         </Text>
//       </TouchableOpacity>
//       <View style={styles.iconContainer}>
//         {activeGoal === item.id ? (
//           <>
//             <TouchableOpacity onPress={() => openModal("edit", item.id)}>
//               <MaterialIcons name="edit" size={24} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
//               <MaterialIcons name="delete" size={24} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setActiveGoal(null)}>
//               <MaterialIcons name="close" size={24} color="#fff" />
//             </TouchableOpacity>
//           </>
//         ) : (
//           <TouchableOpacity
//             style={styles.menuButton}
//             onPress={() => setActiveGoal(item.id)}
//           >
//             <MaterialIcons name="more-vert" size={24} color="#fff" />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>{title}</Text>
//       <FlatList
//         data={goals}
//         renderItem={renderGoalItem}
//         keyExtractor={(item) => item.id}
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
//               {modalType === "add" ? "New Goal" : "Edit Goal"}
//             </Text>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Enter goal name"
//               placeholderTextColor="#aaa"
//               value={goalName}
//               onChangeText={setGoalName}
//             />
//             <Text style={styles.pickerLabel}>Goal Necessity Score:</Text>
//             <Picker
//               selectedValue={goalScore}
//               style={styles.picker}
//               onValueChange={(itemValue) => setGoalScore(itemValue)}
//             >
//               {[1, 2, 3, 4, 5].map((score) => (
//                 <Picker.Item
//                   key={score}
//                   label={score.toString()}
//                   value={score}
//                 />
//               ))}
//             </Picker>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 onPress={modalType === "add" ? handleAddGoal : handleUpdateGoal}
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
//     padding: 20,
//     backgroundColor: "#121212",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginVertical: 20,
//   },
//   goalItemContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#1E1E1E",
//     padding: 20,
//     marginVertical: 8,
//     marginHorizontal: 16,
//     borderRadius: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   goalItem: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   goalName: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     flex: 1,
//     marginLeft: 10,
//   },
//   completedGoal: {
//     textDecorationLine: "line-through",
//     color: "#888",
//   },
//   scoreIndicator: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   scoreText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   iconContainer: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     width: 120,
//   },
//   menuButton: {
//     padding: 5,
//   },
//   floatingButton: {
//     position: "absolute",
//     right: 20,
//     bottom: 20,
//     backgroundColor: "#7E57C2",
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 3,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: 300,
//     padding: 20,
//     backgroundColor: "#1E1E1E",
//     borderRadius: 5,
//   },
//   modalHeader: {
//     fontSize: 20,
//     color: "#fff",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   textInput: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 20,
//     color: "#000",
//   },
//   pickerLabel: {
//     fontSize: 16,
//     color: "#fff",
//     marginBottom: 10,
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     marginBottom: 20,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalButtonText: {
//     fontSize: 18,
//     color: "#7E57C2",
//     padding: 10,
//   },
// });
