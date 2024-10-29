import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install this package

interface Props {
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<Props> = ({ onColorSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#39FF14"); // Default color
  const colors = [
    "#39FF14",
    "#FF3503",
    "#00FFE5",
    "#FF1493",
    "#8A2BE2",
    "#FE59C2",
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color); // Update the selected color
    onColorSelect(color);
    setModalVisible(false); // Close the modal after selecting a color
  };

  return (
    <View style={styles.container}>
      <Text style={styles.colorPickerLabel}>Choose section color:</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View
          style={{
            width: 15,
            height: 30,
            borderRadius: 10,
            backgroundColor: selectedColor, // Display the selected color
            marginLeft: 10,
            marginBottom: 10,
          }}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select a Color</Text>
            <View style={styles.colorPickerContainer}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  colorPickerLabel: {
    fontSize: 16,
    color: "white",
    paddingBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: 300,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: "white",
  },
  colorPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: 20,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    marginTop: 5,
    marginHorizontal: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
});

export default ColorPicker;
