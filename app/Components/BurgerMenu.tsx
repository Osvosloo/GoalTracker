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
import { useRouter } from "expo-router";

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ visible, onClose }) => {
  const translateX = useRef(new Animated.Value(-300)).current; // Start off-screen to the left
  const router = useRouter();

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
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/");
            }}
          >
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push("/DashboardScreen");
            }}
          >
            <Text style={styles.menuText}>Dashboard</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    width: "80%",
    height: "100%",
    backgroundColor: "#1E1E1E",
    // backgroundColor: "#0C1218",
    padding: 20,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  menuText: {
    color: "#fff",
    fontSize: 24,
  },
});

export default BurgerMenu;
