import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, Redirect } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { useSession } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import {
  ACCENT,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
} from "@/lib/theme";

export default function PrivateChatList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conn } = useSpacetimeDB(); const { identity } = conn;
  const { isLoading, user } = useSession();
  const [query, setQuery] = useState("");
  const { messages: allMessages, users } = useSpacetimeDB();

  const myId = identity?.toHexString();

  const privateChats = useMemo(() => {
    if (!myId) return [];
    const privateMsgs = allMessages.filter((m) => m.roomType === "private");
    const roomMap = new Map<string, { roomId: string; lastBody: string; lastTime: bigint; otherUserId: string }>();
    for (const m of privateMsgs) {
      const existing = roomMap.get(m.roomId);
      const mTime = BigInt(m.sent as unknown as number);
      if (!existing || mTime > existing.lastTime) {
        const parts = m.roomId.split("_");
        const otherUserId = parts[0] === myId ? parts[1] : parts[0];
        roomMap.set(m.roomId, { roomId: m.roomId, lastBody: m.body, lastTime: mTime, otherUserId });
      }
    }
    return Array.from(roomMap.values()).sort((a, b) => Number(b.lastTime) - Number(a.lastTime));
  }, [allMessages, myId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return privateChats;
    const q = query.toLowerCase();
    return privateChats.filter((c) => {
      const u = users.find((u) => u.identity.toHexString() === c.otherUserId);
      return u?.displayName.toLowerCase().includes(q) || u?.handle.toLowerCase().includes(q);
    });
  }, [privateChats, query, users]);

  if (isLoading) return null;
  if (!user) return <Redirect href="/sign-in" />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: "600", color: TEXT }}>Private Chats</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: SURFACE_ALT, borderRadius: 20, height: 40, paddingHorizontal: 12, marginTop: 10 }}>
          <Ionicons name="search" size={16} color={MUTED} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search chats..." placeholderTextColor={MUTED} style={{ flex: 1, height: 40, paddingHorizontal: 8, color: TEXT, fontSize: 14 }} />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.roomId}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Ionicons name="chatbubble-outline" size={40} color={MUTED} />
            <Text style={{ fontSize: 14, color: MUTED, marginTop: 12 }}>No private chats yet</Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Start a conversation with another user</Text>
          </View>
        }
        renderItem={({ item }) => {
          const otherUser = users.find((u) => u.identity.toHexString() === item.otherUserId);
          const name = otherUser?.displayName ?? item.otherUserId.slice(0, 8);
          return (
            <Pressable
              onPress={() => router.push(`/chats/private/${item.roomId}` as any)}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? SURFACE_HOVER : "white" })}
            >
              <Avatar name={name} size={44} seed={item.otherUserId} />
              <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 15, color: TEXT, fontWeight: "500" }}>{name}</Text>
                <Text numberOfLines={1} style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{item.lastBody}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
