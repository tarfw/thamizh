import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { callReducer, ensureConnected } from "@/lib/db";
import { useSession } from "@/lib/auth";
import { signInWithBluesky } from "@/lib/bluesky-auth";
import Svg, { Line } from "react-native-svg";
import {
  ACCENT,
  ACCENT_DARK,
  BORDER_IDLE,
  DANGER,
  MUTED,
  SURFACE_ALT,
  TEXT,
} from "@/lib/theme";

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"handle" | "auth" | "connecting">("handle");

  if (sessionUser) return <Redirect href="/spaces" />;

  const submit = async () => {
    const trimmed = handle.trim();
    const pwd = password.trim();
    if (!trimmed || !pwd) return;
    setBusy(true);
    setError(null);
    try {
      setStep("auth");
      const bskySession = await signInWithBluesky(trimmed, pwd);

      setStep("connecting");
      await ensureConnected();
      await callReducer("set_display_name", {
        displayName: bskySession.handle,
        handle: bskySession.handle,
      });
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
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <View style={{ marginBottom: 24 }}>
            <FiveWingAsterisk size={28} color={ACCENT} />
          </View>

          <Text
            style={{
              fontSize: 48,
              color: TEXT,
              textAlign: "left",
              fontWeight: "900",
              letterSpacing: -1.5,
              lineHeight: 52,
            }}
          >
            {"thamizh\nsocial\nproject"}
          </Text>

          {step === "handle" ? (
            <View style={{ width: "100%", marginTop: "auto", marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: TEXT,
                  fontWeight: "600",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Sign in with your Bluesky account
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
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 15, color: MUTED, marginRight: 4 }}>
                  @
                </Text>
                <TextInput
                  value={handle}
                  onChangeText={setHandle}
                  placeholder="username.bsky.social"
                  placeholderTextColor={MUTED}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  style={{
                    flex: 1,
                    color: TEXT,
                    fontSize: 15,
                    height: 52,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: password ? ACCENT : BORDER_IDLE,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 52,
                  backgroundColor: SURFACE_ALT,
                  marginBottom: 8,
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="App Password"
                  placeholderTextColor={MUTED}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
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
              
              <Text
                style={{
                  fontSize: 12,
                  color: MUTED,
                  textAlign: "center",
                  lineHeight: 16,
                  marginTop: 6,
                }}
              >
                Recommended: Create an App Password in Bluesky under Settings &gt; App Passwords.
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: "auto", marginBottom: 20 }}>
              <ActivityIndicator color={ACCENT} size="large" />
              <Text
                style={{ fontSize: 14, color: MUTED, marginTop: 16 }}
              >
                {step === "auth"
                  ? "Signing in to Bluesky..."
                  : "Connecting to server..."}
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
                width: "100%",
              }}
            >
              <Ionicons name="alert-circle" size={16} color={DANGER} />
              <Text
                style={{
                  fontSize: 13,
                  color: DANGER,
                  marginLeft: 8,
                  fontWeight: "500",
                  flex: 1,
                }}
              >
                {error}
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: "100%" }}>
          <Pressable
            onPress={submit}
            disabled={busy || !handle.trim() || !password.trim()}
            style={({ pressed }) => ({
              backgroundColor: !handle.trim() || !password.trim()
                ? SURFACE_ALT
                : pressed
                  ? ACCENT_DARK
                  : ACCENT,
              paddingVertical: 16,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: !handle.trim() || !password.trim() ? MUTED : "white",
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}
              >
                {step === "handle" ? "Sign in with Bluesky" : "Connecting..."}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FiveWingAsterisk({ size = 28, color = "#000" }: { size?: number; color?: string }) {
  const c = size / 2;
  const r = size / 2 - 1;
  const stroke = Math.max(2, size * 0.16);
  const wings = [0, 1, 2, 3, 4].map((i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return {
      x: c + r * Math.cos(angle),
      y: c + r * Math.sin(angle),
    };
  });
  return (
    <Svg width={size} height={size}>
      {wings.map((w, i) => (
        <Line
          key={i}
          x1={c}
          y1={c}
          x2={w.x}
          y2={w.y}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}
