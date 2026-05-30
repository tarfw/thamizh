import React, { useState } from "react";
import { FlatList, Text, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/lib/Pressable";
import {
  ACCENT,
  ACCENT_SOFT,
  HAIRLINE,
  MUTED,
  SUCCESS,
  SURFACE_HOVER,
  TEXT,
  TEXT_SECONDARY,
} from "@/lib/theme";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RoadmapItem = {
  id: string;
  titleEn: string;
  titleTa: string;
  desc: string;
  status: "Completed" | "In Progress" | "Planned";
};

const ROADMAP_DATA: RoadmapItem[] = [
  {
    id: "1",
    titleEn: "Tamil AI Assistant Integration",
    titleTa: "தமிழ் AI உதவியாளர் இணைப்பு",
    desc: "Deploying a quantized Llama-3-8B-Instruct model optimized for Tamil language processing and RAG pipeline mapping state policy and legal documents.",
    status: "In Progress",
  },
  {
    id: "2",
    titleEn: "Participatory Budgeting",
    titleTa: "பட்ஜெட் வாக்கெடுப்பு முறை",
    desc: "Implementing quadratic voting on-chain or via cryptographically signed local state logs utilizing ed25519 signatures for voter verified budget allocations.",
    status: "Planned",
  },
  {
    id: "3",
    titleEn: "Decentralized Audit Ledger",
    titleTa: "பொது தணிக்கை கணக்கு",
    desc: "SQLite local-first sync schema with CRDT-based merging using a Cloudflare Durable Object synchronization gateway.",
    status: "In Progress",
  },
  {
    id: "4",
    titleEn: "Blood & Organ Donor Network",
    titleTa: "இரத்த மற்றும் உறுப்பு தானப் பதிவு",
    desc: "A zero-knowledge identity matching proof system for privacy-preserving emergency medical requests.",
    status: "Completed",
  },
  {
    id: "5",
    titleEn: "Anti-Caste Justice Portal",
    titleTa: "சாதி ஒழிப்பு நீதி போர்டல்",
    desc: "Censorship-resistant anonymous reporting ledger using cryptographic hash chaining and decentralized IPFS media attachments.",
    status: "In Progress",
  },
  {
    id: "6",
    titleEn: "Local Node Registry",
    titleTa: "உள்ளூர் கிளை மேலாண்மை",
    desc: "Peer-to-peer discovery registry using Kademlia DHT for verifying node hardware identity and system uptime.",
    status: "Planned",
  },
  {
    id: "7",
    titleEn: "Tamil Eelam Rights Archive",
    titleTa: "தமிழீழ உரிமை ஆவணக் காப்பகம்",
    desc: "InterPlanetary File System (IPFS) pinning service integrated with decentralized metadata indexing for historical archives.",
    status: "Planned",
  },
];

export default function Roadmap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStatusColor = (status: RoadmapItem["status"]) => {
    switch (status) {
      case "Completed":
        return SUCCESS;
      case "In Progress":
        return ACCENT;
      case "Planned":
        return "#B06000";
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
        }}
      >
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
          Project Roadmap
        </Text>
      </View>

      <FlatList
        data={ROADMAP_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 20,
        }}
        renderItem={({ item, index }) => {
          const isExpanded = expandedId === item.id;
          const color = getStatusColor(item.status);

          return (
            <View
              style={{
                borderBottomWidth: index === ROADMAP_DATA.length - 1 ? 0 : 1,
                borderBottomColor: HAIRLINE,
              }}
            >
              <Pressable
                onPress={() => toggleExpand(item.id)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 18,
                  backgroundColor: pressed ? SURFACE_HOVER : "white",
                })}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: TEXT,
                    }}
                  >
                    {item.titleEn}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: MUTED,
                      marginTop: 2,
                    }}
                  >
                    {item.titleTa}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: item.status === "Completed" ? "#E6F4EA" : item.status === "In Progress" ? ACCENT_SOFT : "#FEF7E0",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={MUTED}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={{ paddingBottom: 18, paddingHorizontal: 2 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: TEXT_SECONDARY,
                      lineHeight: 18,
                    }}
                  >
                    {item.desc}
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
