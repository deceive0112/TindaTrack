import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modals/add-product" options={{ presentation: "modal", title: "Add Product" }} />
      <Stack.Screen name="modals/add-sale" options={{ presentation: "modal", title: "New Sale" }} />
      <Stack.Screen name="modals/receipt" options={{ presentation: "modal", title: "Receipt" }} />
    </Stack>
  );
}
