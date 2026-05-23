import { Stack } from "expo-router";

export default function ConstituencyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
        statusBarTranslucent: true,
        statusBarStyle: "dark",
        statusBarBackgroundColor: "#ffffff",
        animation: "slide_from_right",
      }}
    />
  );
}
