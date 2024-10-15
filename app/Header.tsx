import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const router = useRouter();

  const navigateToDashboard = () => {
    router.push("/DashboardScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.burgerMenu}>
          <MaterialIcons name="menu" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>{title}</Text>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={navigateToDashboard}
        >
          <MaterialIcons name="dashboard" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute", // Keep the header absolutely positioned
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it's above other components
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1e1e1e", // Header background color
    height: 75, // Fixed height for the header
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  header: {
    color: "#fff",
    fontSize: 20,
  },
  burgerMenu: {
    padding: 5,
  },
  dashboardButton: {
    padding: 5,
  },
});

export default Header;
