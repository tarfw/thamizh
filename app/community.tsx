import React from "react";
import { FlatList, Text, View, Share } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/lib/Pressable";
import {
  ACCENT,
  ACCENT_SOFT,
  HAIRLINE,
  MUTED,
  TEXT,
  avatarColor,
  initialsOf,
} from "@/lib/theme";

type Member = {
  id: string;
  name: string;
  handle: string;
  isAdmin?: boolean;
};

const COMMUNITY_MEMBERS: Record<string, Member[]> = {
  Tamilnadu: [
    { id: "tn-1", name: "Karthik Raja", handle: "karthik.bsky.social", isAdmin: true },
    { id: "tn-2", name: "Priya Sundar", handle: "priya.bsky.social" },
    { id: "tn-3", name: "Anbarasan", handle: "anbu.bsky.social" },
    { id: "tn-4", name: "Senthamizhan", handle: "senthamizh.bsky.social" },
    { id: "tn-5", name: "Valarmathi", handle: "valar.bsky.social" },
  ],
  Eelam: [
    { id: "el-1", name: "Tharshan", handle: "tharshan.bsky.social", isAdmin: true },
    { id: "el-2", name: "Subashini", handle: "suba.bsky.social" },
    { id: "el-3", name: "Mayuran", handle: "mayuran.bsky.social" },
    { id: "el-4", name: "Yalini", handle: "yalini.bsky.social" },
  ],
};

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: "Tamilnadu" | "Eelam" }>();

  const communityId = id || "Tamilnadu";
  const communityName = communityId === "Tamilnadu" ? "Tamil Nadu Community" : "Eelam Community";
  const members = COMMUNITY_MEMBERS[communityId] || [];
  const inviteLink = `https://thamizh.org/join/community/${communityId}`;

  const handleInvite = async () => {
    try {
      await Share.share({
        message: `Join our active participatory community "${communityName}" on thamizh app: ${inviteLink}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: HAIRLINE,
          backgroundColor: "white",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: TEXT,
              marginLeft: 8,
              letterSpacing: -0.3,
            }}
          >
            {communityName}
          </Text>
        </View>

        <Pressable
          onPress={handleInvite}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
            marginRight: 8,
          })}
        >
          <Ionicons name="share-social-outline" size={22} color={ACCENT} />
        </Pressable>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 20,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: MUTED }}>
              {members.length} active members
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors = avatarColor(item.name);
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: HAIRLINE,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.bg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.fg }}>
                    {initialsOf(item.name)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: TEXT }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: MUTED }}>
                    @{item.handle}
                  </Text>
                </View>
              </View>

              {item.isAdmin && (
                <View
                  style={{
                    backgroundColor: ACCENT_SOFT,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, color: ACCENT, fontWeight: "700" }}>
                    ADMIN
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
