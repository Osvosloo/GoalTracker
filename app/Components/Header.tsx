import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Provider, Tooltip } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BurgerMenu from "./BurgerMenu";
import FeedbackModal from "../DashboardComp/FeedbackModal";

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
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const navigateToDashboard = () => {
    router.push("/DashboardScreen");
  };

  const getFeedback = () => {
    setModalVisible(true); // Open the feedback modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Close the feedback modal
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

          {showDashboardButton ? (
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
          ) : (
            <Tooltip
              title="Get AI Feedback"
              enterTouchDelay={200}
              leaveTouchDelay={200}
            >
              <TouchableOpacity
                style={styles.feedbackButton}
                onPress={getFeedback}
              >
                <FontAwesome name="lightbulb-o" size={24} color="#fff" />
              </TouchableOpacity>
            </Tooltip>
          )}
        </View>
        <BurgerMenu visible={menuVisible} onClose={toggleMenu} />

        {/* Feedback Modal */}
        <FeedbackModal visible={modalVisible} onClose={handleCloseModal} />
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
    height: 70,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  headerContainer: {
    flex: 1,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
  },
  burgerMenu: {
    padding: 5,
  },
  dashboardButton: {
    padding: 5,
  },
  feedbackButton: {
    padding: 5,
  },
});

export default Header;
