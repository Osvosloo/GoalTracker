import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Root screen for the app */}
      <Stack.Screen
        name="index"
        options={{ title: "Home" }} // Set the title for the home screen
      />
      {/* You can add more screens here as needed */}
    </Stack>
  );
}
