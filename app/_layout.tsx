import "../lib/polyfills";
import { DefaultTheme, ThemeProvider, Theme } from "@react-navigation/native";
import "../global.css";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#ffffff",
    card: "#ffffff",
    border: "transparent",
    primary: "#1A73E8",
    text: "#202124",
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider value={AppTheme}>
          <Stack
              screenOptions={{
                headerShown: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: "#ffffff" },
                headerTitleStyle: { color: "#202124", fontWeight: "500" },
                headerTintColor: "#202124",
                contentStyle: { backgroundColor: "#ffffff" },
                statusBarTranslucent: true,
                statusBarStyle: "dark",
                statusBarBackgroundColor: "#ffffff",
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="pick-constituency" options={{ headerShown: false }} />
              <Stack.Screen name="spaces/index" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="community" options={{ headerShown: false }} />
              <Stack.Screen name="roadmap" options={{ headerShown: false }} />
              <Stack.Screen name="chats/private/index" options={{ headerShown: false }} />
              <Stack.Screen name="chats/private/[id]/index" options={{ headerShown: false }} />
              <Stack.Screen name="chats/groups/index" options={{ headerShown: false }} />
              <Stack.Screen name="chats/groups/create" options={{ headerShown: false }} />
              <Stack.Screen name="chats/groups/[id]/index" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>

          <StatusBar style="dark" />
        </ThemeProvider>
    </SafeAreaProvider>
  );
}
