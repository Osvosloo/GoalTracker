import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Provider, Tooltip } from "react-native-paper";
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

          <View style={styles.headerContainer}>
            <Text style={styles.header}>{title}</Text>
          </View>

          {showDashboardButton && (
            <Tooltip
              title="Go to Dashboard"
              enterTouchDelay={200}
              leaveTouchDelay={200}
            >
              <TouchableOpacity
                style={styles.dashboardButton}
                onPress={navigateToDashboard}
              >
                <MaterialIcons name="dashboard" size={24} color="#fff" />
              </TouchableOpacity>
            </Tooltip>
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
    justifyContent: "space-between", // Space between the items
    padding: 10,
    backgroundColor: "#1e1e1e",
    height: 70,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  headerContainer: {
    flex: 1, // Take up available space
    flexGrow: 1,
    alignItems: "center", // Center the header text
    justifyContent: "center", // Center the header text vertically
  },
  header: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center", // Center the text within the container
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
