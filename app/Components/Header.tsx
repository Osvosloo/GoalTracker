import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Menu, Provider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BurgerMenu from "./BurgerMenu";

interface HeaderProps {
  title: string;
  showDashboardButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showDashboardButton = false,
}) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={[styles.topBar]}>
          <TouchableOpacity style={styles.burgerMenu} onPress={toggleMenu}>
            <MaterialIcons name="menu" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>{title}</Text>
          {showDashboardButton && (
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={navigateToDashboard}
            >
              <MaterialIcons name="dashboard" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <BurgerMenu visible={menuVisible} onClose={toggleMenu} />
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#121212",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#1e1e1e",
    height: 70, // Adjust height if necessary
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  header: {
    color: "#fff",
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 37, // Adjust as needed
  },
  burgerMenu: {
    padding: 5,
  },
  dashboardButton: {
    padding: 5,
  },
  menu: {
    zIndex: 30,
    marginTop: 80,
  },
});

export default Header;
