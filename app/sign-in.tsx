import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/lib/db";
import BrandLogo from "@/lib/BrandLogo";
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_SOFT,
  DANGER,
  MUTED,
  TEXT,
} from "@/lib/theme";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = db.useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enterApp = async () => {
    setBusy(true);
    setError(null);
    try {
      await db.auth.signInAsGuest();
    } catch (err: any) {
      setError(err?.body?.message ?? err?.message ?? "Could not enter the app");
    } finally {
      setBusy(false);
    }
  };

  if (!isLoading && user) return <Redirect href="/" />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 64,
          paddingBottom: insets.bottom + 40,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: ACCENT_SOFT,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 3,
              marginBottom: 24,
            }}
          >
            <BrandLogo size={52} color={ACCENT} />
          </View>

          <Text
            style={{
              fontSize: 38,
              color: TEXT,
              textAlign: "center",
              fontWeight: "800",
              letterSpacing: -1,
            }}
          >
            thamizh
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: MUTED,
              textAlign: "center",
              marginTop: 6,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1.6,
            }}
          >
            decentralized ai governance
          </Text>



          {error && (
            <View
              style={{
                marginTop: 24,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FCE8E6",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Ionicons name="alert-circle" size={16} color={DANGER} />
              <Text style={{ fontSize: 13, color: DANGER, marginLeft: 8, fontWeight: "500" }}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: "100%" }}>
          <Pressable
            onPress={enterApp}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: pressed ? ACCENT_DARK : ACCENT,
              paddingVertical: 16,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: ACCENT,
              shadowOpacity: pressed ? 0.2 : 0.1,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 6,
              elevation: 2,
            })}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                Enter the App
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
