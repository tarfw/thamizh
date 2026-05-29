import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { callReducer } from "@/lib/db";
import { ACCENT, ACCENT_DARK, BORDER_IDLE, HAIRLINE, MUTED, SURFACE_ALT, TEXT } from "@/lib/theme";

export default function CreateGroup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);


  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const groupId = await callReducer("create_group", { name: name.trim() });
      router.replace(`/chats/groups/${groupId}` as any);
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: HAIRLINE }}>
        <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: "600", color: TEXT, flex: 1, textAlign: "center" }}>New Group</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 14, color: TEXT, fontWeight: "500", marginBottom: 8 }}>Group Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter group name"
          placeholderTextColor={MUTED}
          autoFocus
          style={{ borderWidth: 1, borderColor: name ? ACCENT : BORDER_IDLE, borderRadius: 16, paddingHorizontal: 16, height: 52, color: TEXT, fontSize: 15, backgroundColor: SURFACE_ALT }}
        />
        <Pressable
          onPress={submit}
          disabled={!name.trim() || busy}
          style={({ pressed }) => ({ marginTop: 20, backgroundColor: !name.trim() ? SURFACE_ALT : pressed ? ACCENT_DARK : ACCENT, paddingVertical: 16, borderRadius: 28, alignItems: "center" })}
        >
          <Text style={{ color: !name.trim() ? MUTED : "white", fontSize: 16, fontWeight: "600" }}>{busy ? "Creating..." : "Create Group"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
