// _layout.tsx
import { Stack } from "expo-router";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="SectionScreen" />
        <Stack.Screen name="DashboardScreen" />
        <Stack.Screen name="TestScreen" />
      </Stack>
    </PaperProvider>
  );
}
