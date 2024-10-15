import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Menu, Provider } from "react-native-paper";

interface HeaderProps {
  title: string;
  showDashboardButton?: boolean; // New prop to control visibility
}

const Header: React.FC<HeaderProps> = ({
  title,
  showDashboardButton = false,
}) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const navigateToDashboard = () => {
    router.push("/DashboardScreen");
  };

  const handleMenuItemPress = (route: string) => {
    setMenuVisible(false);
    router.push(route);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topBar}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity style={styles.burgerMenu} onPress={toggleMenu}>
                <MaterialIcons name="menu" size={30} color="#fff" />
              </TouchableOpacity>
            }
            style={styles.menu} // Set a custom style for the Menu
          >
            <Menu.Item
              onPress={() => handleMenuItemPress("/ProfileScreen")}
              title="Profile"
            />
            <Menu.Item
              onPress={() => handleMenuItemPress("/SettingsScreen")}
              title="Settings"
            />
            <Menu.Item
              onPress={() => handleMenuItemPress("/HelpScreen")}
              title="Help"
            />
          </Menu>
          <Text style={styles.header}>{title}</Text>
          {showDashboardButton && ( // Conditionally render the dashboard button
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={navigateToDashboard}
            >
              <MaterialIcons name="dashboard" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1e1e1e",
    height: 75,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  header: {
    // backgroundColor: "#7E57C2",
    color: "#fff",
    fontSize: 20,
    flex: 1, // Allow the title to take up available space
    textAlign: "center",
    marginRight: 37,
  },
  burgerMenu: {
    padding: 5,
  },
  dashboardButton: {
    padding: 5,
  },
  menu: {
    zIndex: 30, // Ensure the menu is above other components
  },
});

export default Header;
