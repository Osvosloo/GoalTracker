// ColorPicker.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<Props> = ({ onColorSelect }) => {
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

const styles = StyleSheet.create({
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
});

export default ColorPicker;
