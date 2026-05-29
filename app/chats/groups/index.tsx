import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, Redirect } from "expo-router";
import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { useSession } from "@/lib/auth";
import { ts } from "@/lib/db";
import Avatar from "@/lib/Avatar";
import { ACCENT, HAIRLINE, MUTED, SURFACE_HOVER, TEXT } from "@/lib/theme";

export default function GroupChatList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conn } = useSpacetimeDB();
  const { identity } = conn;
  const { isLoading, user } = useSession();
  const { groupChats, groupMembers, messages: allMessages } = useSpacetimeDB();
  const myId = identity?.toHexString();

  const myGroups = useMemo(() => {
    if (!myId) return [];
    const myGroupIds = new Set(
      groupMembers.filter((m) => m.memberId.toHexString() === myId).map((m) => m.groupId)
    );
    return groupChats.filter((g) => myGroupIds.has(g.id)).map((g) => {
      const lastMsg = allMessages
        .filter((m) => m.roomType === "group" && m.roomId === String(g.id))
        .sort((a, b) => ts(b.sent) - ts(a.sent))[0];
      return { ...g, lastBody: lastMsg?.body ?? "", memberCount: groupMembers.filter((m) => m.groupId === g.id).length };
    });
  }, [groupChats, groupMembers, allMessages, myId]);

  if (isLoading) return null;
  if (!user) return <Redirect href="/sign-in" />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="arrow-back" size={22} color={TEXT} />
        </Pressable>
        <Text style={{ fontSize: 17, fontWeight: "600", color: TEXT }}>Groups</Text>
        <Pressable onPress={() => router.push("/chats/groups/create" as any)} hitSlop={8} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={24} color={ACCENT} />
        </Pressable>
      </View>
      <FlatList
        data={myGroups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={<View style={{ alignItems: "center", paddingTop: 48 }}><Ionicons name="people-outline" size={40} color={MUTED} /><Text style={{ fontSize: 14, color: MUTED, marginTop: 12 }}>No groups yet</Text></View>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/chats/groups/${item.id}` as any)}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? SURFACE_HOVER : "white" })}
          >
            <Avatar name={item.name} size={44} seed={String(item.id)} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text numberOfLines={1} style={{ fontSize: 15, color: TEXT, fontWeight: "500" }}>{item.name}</Text>
              <Text numberOfLines={1} style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{item.lastBody || `${item.memberCount} members`}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
