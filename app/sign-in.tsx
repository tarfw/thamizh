import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
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
  BORDER_IDLE,
  DANGER,
  MUTED,
  TEXT,
} from "@/lib/theme";

type Step = "email" | "code";

function FloatingLabelInput({
  label,
  value,
  onChangeText,
  editable,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  [key: string]: any;
}) {
  const [focused, setFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    position: "absolute" as const,
    left: 14,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 6],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: focused ? ACCENT : MUTED,
    fontWeight: "500" as const,
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: focused ? ACCENT : BORDER_IDLE,
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 14,
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Animated.Text style={labelStyle} pointerEvents="none">
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={editable}
        {...props}
        style={[
          {
            color: TEXT,
            fontSize: 16,
            paddingTop: value || focused ? 14 : 0,
            height: "100%",
            textAlignVertical: "center",
          },
          props.style,
        ]}
      />
    </View>
  );
}

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = db.useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    const e = email.trim().toLowerCase();
    if (!e) return;
    setBusy(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email: e });
      setStep("code");
    } catch (err: any) {
      setError(err?.body?.message ?? err?.message ?? "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const c = code.trim();
    if (!c) return;
    setBusy(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({
        email: email.trim().toLowerCase(),
        code: c,
      });
    } catch (err: any) {
      setError(err?.body?.message ?? err?.message ?? "Invalid code");
      setBusy(false);
    }
  };

  if (!isLoading && user) return <Redirect href="/" />;

  const disabled =
    busy || (step === "email" ? !email.trim() : !code.trim());

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: ACCENT_SOFT,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: ACCENT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <BrandLogo size={44} color={ACCENT} />
          </View>
        </View>

        <Text
          style={{
            fontSize: 34,
            color: TEXT,
            textAlign: "center",
            fontWeight: "700",
            letterSpacing: -0.8,
          }}
        >
          thamizh
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: MUTED,
            textAlign: "center",
            marginTop: 4,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          decentralized ai governance
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: MUTED,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 20,
          }}
        >
          {step === "email"
            ? "Sign in to continue"
            : `Enter the code sent to ${email}`}
        </Text>

        <View style={{ height: 36 }} />

        {step === "email" ? (
          <FloatingLabelInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={sendCode}
            editable={!busy}
          />
        ) : (
          <>
            <FloatingLabelInput
              label="6-digit code"
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoComplete="one-time-code"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={verify}
              editable={!busy}
              style={{
                letterSpacing: code ? 6 : 0,
                fontSize: code ? 20 : 16,
              }}
            />
            <Pressable
              onPress={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              hitSlop={8}
              style={{ alignSelf: "flex-start", marginTop: 14 }}
            >
              <Text style={{ fontSize: 14, color: ACCENT, fontWeight: "500" }}>
                Use a different email
              </Text>
            </Pressable>
          </>
        )}

        {error && (
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="alert-circle" size={16} color={DANGER} />
            <Text style={{ fontSize: 13, color: DANGER, marginLeft: 6 }}>
              {error}
            </Text>
          </View>
        )}

        <View style={{ flex: 1, minHeight: 24 }} />

        <Pressable
          onPress={step === "email" ? sendCode : verify}
          disabled={disabled}
          style={({ pressed }) => ({
            backgroundColor: disabled ? "#C5D7F8" : pressed ? ACCENT_DARK : ACCENT,
            paddingVertical: 14,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: pressed ? 0.12 : 0.06,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 2,
            elevation: pressed ? 2 : 1,
          })}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: "500",
                letterSpacing: 0.2,
              }}
            >
              {step === "email" ? "Send code" : "Verify"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
