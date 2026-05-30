import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useState, useEffect } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { callReducer, ts } from "@/lib/db";
import { useSession } from "@/lib/auth";
import { markRead } from "@/lib/unread";
import Avatar from "@/lib/Avatar";
import { ACCENT, ACCENT_DARK, BORDER_IDLE, HAIRLINE, MUTED, SURFACE_ALT, TEXT } from "@/lib/theme";

export default function PrivateChatRoom() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const { conn } = useSpacetimeDB(); const { identity } = conn;
  const { isLoading, user, profile } = useSession();
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const { messages: allMessages, users } = useSpacetimeDB();

  const myId = identity?.toHexString();
  const parts = roomId?.split("_") ?? [];
  const otherId = myId ? (parts[0] === myId ? parts[1] : parts[0]) : "";
  const otherUser = users.find((u) => u.identity.toHexString() === otherId);

  const messages = allMessages
    .filter((m) => m.roomType === "private" && m.roomId === roomId)
    .sort((a, b) => ts(b.sent) - ts(a.sent));

  const latestTs = messages[0] ? ts(messages[0].sent) : 0;
  useEffect(() => {
    if (roomId && latestTs > 0) {
      markRead(roomId, latestTs);
    }
  }, [roomId, latestTs]);

  if (isLoading) return null;
  if (!user) return <Redirect href="/sign-in" />;

  const send = async () => {
    const body = draft.trim();
    if (!body || !roomId) return;
    setDraft("");
    try {
      await callReducer("send_message", { roomType: "private", roomId, body, parentId: undefined });
    } catch (e) {
      console.error("[private] send_message failed:", e);
      setDraft(body);
    }
  };

  const canSend = !!draft.trim();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: HAIRLINE }}>
        <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </Pressable>
          <Avatar name={otherUser?.displayName ?? "User"} size={36} seed={otherId} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, color: TEXT, fontWeight: "500" }}>{otherUser?.displayName ?? otherId.slice(0, 8)}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          style={{ flex: 1 }}
          data={messages}
          inverted
          keyExtractor={(m, idx) => `${m.sender.toHexString()}_${ts(m.sent)}_${idx}`}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8, flexGrow: 1, justifyContent: messages.length === 0 ? "center" : "flex-start" }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Ionicons name="chatbox-outline" size={32} color={MUTED} />
              <Text style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>Start chatting</Text>
            </View>
          }
          renderItem={({ item }) => {
            const mine = item.sender.toHexString() === myId;
            return (
              <View style={{ flexDirection: "row", marginTop: 4, paddingHorizontal: 4, justifyContent: mine ? "flex-end" : "flex-start" }}>
                <View style={{ maxWidth: "76%", paddingHorizontal: 14, paddingVertical: 9, backgroundColor: mine ? ACCENT : SURFACE_ALT, borderRadius: 18 }}>
                  <Text style={{ color: mine ? "white" : TEXT, fontSize: 15, lineHeight: 20 }}>{item.body}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={{ backgroundColor: "white", paddingBottom: insets.bottom || 8, paddingTop: 8, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: HAIRLINE }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", borderWidth: 1, borderColor: focused ? ACCENT : BORDER_IDLE, borderRadius: 24, paddingHorizontal: 4, paddingVertical: 4, backgroundColor: "white", minHeight: 48 }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Message"
              placeholderTextColor={MUTED}
              multiline
              style={{ flex: 1, maxHeight: 120, minHeight: 38, paddingHorizontal: 4, paddingVertical: Platform.OS === "ios" ? 10 : 8, color: TEXT, fontSize: 15, lineHeight: 20 }}
            />
            <Pressable onPress={send} disabled={!canSend} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: !canSend ? "transparent" : pressed ? ACCENT_DARK : ACCENT })}>
              <Ionicons name="send" size={18} color={!canSend ? MUTED : "white"} style={{ marginLeft: -1 }} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
