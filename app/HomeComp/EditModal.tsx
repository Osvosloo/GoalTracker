import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Section } from "../types"; // Ensure this import is correct
import ColorPicker from "./ColorPicker"; // Adjust the path as necessary

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  section: Section | null;
  onUpdate: (title: string, color: string) => void;
  onDelete: (title: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  onClose,
  section,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState(section ? section.title : "");
  const [color, setColor] = useState(section ? section.color : "#000000");

  useEffect(() => {
    if (section) {
      setTitle(section.title);
      setColor(section.color);
    }
  }, [section]);

  const handleSave = () => {
    console.log(`Attempting to save section... ${section}`);
    if (section) {
      console.log("Updating section:", { title, color });
      onUpdate(title, color); // Call the update function passed as a prop
    }
    console.log("Closing modal after saving.");
    onClose(); // Close the modal after saving
  };

  const handleDelete = () => {
    if (section) {
      onDelete(section.title); // Call the delete function passed as a prop
    }
    onClose(); // Close the modal after deletion
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Edit Section</Text>
          <TextInput
            value={title}
            onChangeText={(text) => setTitle(text)}
            placeholder="Section Title"
            style={[styles.textInput, { borderColor: color, borderWidth: 2 }]} // Set border color dynamically
          />
          <View style={styles.selectedColorContainer}>
            <ColorPicker onColorSelect={setColor} />
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[styles.modalButtonText, { color: "red" }]}>
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  selectedColorContainer: {
    marginBottom: 20,
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

export default EditModal;
