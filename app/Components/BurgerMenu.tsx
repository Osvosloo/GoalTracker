import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ visible, onClose }) => {
  const translateX = useRef(new Animated.Value(-300)).current; // Start off-screen to the left

  useEffect(() => {
    if (visible) {
      // Animate to slide in
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate to slide out
      Animated.timing(translateX, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Disable default animation
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.menuContainer, { transform: [{ translateX }] }]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Menu options start from the top */}
          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Text style={styles.menuText}>Help</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  menuContainer: {
    width: "80%", // Adjust as needed
    height: "100%",
    backgroundColor: "#1E1E1E",
    // borderColor: "#0C1218" /* get better color pallette */,
    padding: 20,
    position: "absolute", // Make it absolute to control position
    left: 0, // Align to the left
    right: 0,
    top: 0, // Align to the top
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  menuItem: {
    paddingVertical: 15, // Increased padding for better touch area
    borderBottomWidth: 1, // Add border separating items
    borderBottomColor: "#fff", // Color of the border
  },
  menuText: {
    color: "#fff",
    fontSize: 24, // Increased font size
  },
});

export default BurgerMenu;
