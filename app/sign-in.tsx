import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { callReducer, ensureConnected } from "@/lib/db";
import { useSession, verifyBlueskyHandle } from "@/lib/auth";
import BrandLogo from "@/lib/BrandLogo";
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_SOFT,
  BORDER_IDLE,
  DANGER,
  MUTED,
  SURFACE_ALT,
  TEXT,
} from "@/lib/theme";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conn } = useSpacetimeDB(); const { identity, isActive } = conn;
  const { user: sessionUser } = useSession();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"handle" | "connecting">("handle");

  if (sessionUser) return <Redirect href="/spaces" />;

  const submit = async () => {
    const trimmed = handle.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const { handle: verifiedHandle } = await verifyBlueskyHandle(trimmed);
      setStep("connecting");
      await ensureConnected();
      await callReducer("set_display_name", { displayName: verifiedHandle, handle: verifiedHandle });
      router.replace("/");
    } catch (e: any) {
      setError(e.message ?? String(e));
      setStep("handle");
    } finally {
      setBusy(false);
    }
  };

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

          {step === "handle" ? (
            <View style={{ width: "100%", marginTop: 40 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: TEXT,
                  fontWeight: "500",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Enter your Bluesky handle
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: handle ? ACCENT : BORDER_IDLE,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 52,
                  backgroundColor: SURFACE_ALT,
                }}
              >
                <Text style={{ fontSize: 15, color: MUTED, marginRight: 4 }}>@</Text>
                <TextInput
                  value={handle}
                  onChangeText={setHandle}
                  placeholder="username.bsky.social"
                  placeholderTextColor={MUTED}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  style={{
                    flex: 1,
                    color: TEXT,
                    fontSize: 15,
                    height: 52,
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <ActivityIndicator color={ACCENT} size="large" />
              <Text style={{ fontSize: 14, color: MUTED, marginTop: 16 }}>
                Connecting to server...
              </Text>
            </View>
          )}

          {error && (
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FCE8E6",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Ionicons name="alert-circle" size={16} color={DANGER} />
              <Text style={{ fontSize: 13, color: DANGER, marginLeft: 8, fontWeight: "500", flex: 1 }}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: "100%" }}>
          <Pressable
            onPress={submit}
            disabled={busy || !handle.trim()}
            style={({ pressed }) => ({
              backgroundColor:
                !handle.trim()
                  ? SURFACE_ALT
                  : pressed
                    ? ACCENT_DARK
                    : ACCENT,
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
                  color: !handle.trim() ? MUTED : "white",
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                {step === "handle" ? "Continue with Bluesky" : "Connecting..."}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
