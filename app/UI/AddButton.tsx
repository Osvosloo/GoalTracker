import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Tooltip } from "react-native-paper";

interface Props {
  onPress: () => void;
  tooltipText: string;
}

const AddButton: React.FC<Props> = ({ onPress, tooltipText }) => {
  return (
    <View style={styles.container}>
      <Tooltip title={tooltipText} enterTouchDelay={200} leaveTouchDelay={200}>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <MaterialIcons name="add" size={24} color="#000000" />
        </TouchableOpacity>
      </Tooltip>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddButton;
