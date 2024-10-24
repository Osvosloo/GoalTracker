// _layout.tsx
import { Stack } from "expo-router";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper"; // Import the Provider

export default function RootLayout() {
  return (
    <PaperProvider>
      {/* Wrap your Stack with PaperProvider */}
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
    </PaperProvider>
  );
}
