import { Stack } from "expo-router";
import { createStackNavigator } from "@react-navigation/stack";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Apply globally to all screens
      }}
    >
      {/* Root screen for the app */}
      <Stack.Screen name="index" />
      <Stack.Screen name="SectionScreen" />
      <Stack.Screen name="DashboardScreen" />
    </Stack>
  );
}
