import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View, ActivityIndicator, Dimensions } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useSession, constituencies } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import BrandLogo from "@/lib/BrandLogo";
import {
  ACCENT,
  ACCENT_SOFT,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
} from "@/lib/theme";

type ModuleEntry = {
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleEn: string;
  titleTa: string;
};

const ALL_TOOLS: ModuleEntry[] = [
  {
    href: "ai-assistant",
    icon: "sparkles-outline",
    titleEn: "Tamil AI Assistant",
    titleTa: "தமிழ் AI உதவியாளர்",
  },
  {
    href: "makkal-kural",
    icon: "megaphone-outline",
    titleEn: "Public Voice (Makkal Kural)",
    titleTa: "மக்கள் குரல்",
  },
  {
    href: "rights",
    icon: "shield-checkmark-outline",
    titleEn: "Rights Dashboard",
    titleTa: "உரிமை",
  },
  {
    href: "budget",
    icon: "pie-chart-outline",
    titleEn: "Participatory Budget",
    titleTa: "பட்ஜெட்",
  },
  {
    href: "representatives",
    icon: "people-outline",
    titleEn: "Representative Accountability",
    titleTa: "பிரதிநிதிகள்",
  },
  {
    href: "local-node",
    icon: "git-network-outline",
    titleEn: "Local Node Registry",
    titleTa: "உள்ளூர் கிளை மேலாண்மை",
  },
  {
    href: "anti-caste",
    icon: "alert-circle-outline",
    titleEn: "Anti-Caste Justice",
    titleTa: "சாதி ஒழிப்பு",
  },
  {
    href: "proposals",
    icon: "document-text-outline",
    titleEn: "Proposals & Policy",
    titleTa: "திட்டங்கள்",
  },
  {
    href: "eelam",
    icon: "earth-outline",
    titleEn: "Tamil Eelam Rights",
    titleTa: "தமிழீழ உரிமை",
  },
  {
    href: "makkal-mandram",
    icon: "people-circle-outline",
    titleEn: "People's Assembly",
    titleTa: "மக்கள் மன்றம்",
  },
  {
    href: "law-constitution",
    icon: "journal-outline",
    titleEn: "Law & Constitution Layer",
    titleTa: "சட்டமும் அரசியலமைப்பும்",
  },
  {
    href: "economy",
    icon: "briefcase-outline",
    titleEn: "Democratic Socialist Economy",
    titleTa: "ஜனநாயக சோசலிச பொருளாதாரம்",
  },
  {
    href: "independent-councils",
    icon: "business-outline",
    titleEn: "Independent Councils",
    titleTa: "சுயாதீன குழுக்கள்",
  },
  {
    href: "public-ledger",
    icon: "cube-outline",
    titleEn: "Public Audit Ledger",
    titleTa: "பொது தணிக்கை கணக்கு",
  },
  {
    href: "caste-abolition-audit",
    icon: "ribbon-outline",
    titleEn: "Social Justice Audit",
    titleTa: "சமூக நீதி தணிக்கை",
  },
  {
    href: "member-roles",
    icon: "key-outline",
    titleEn: "Identity & Role Verification",
    titleTa: "உறுப்பினர் பாத்திரங்கள்",
  },
  {
    href: "moderator-dashboard",
    icon: "shield-half-outline",
    titleEn: "Admin & Moderator Console",
    titleTa: "நிர்வாகி டேஷ்போர்டு",
  },
];

const COMMUNITY_TOOLS: ModuleEntry[] = [
  {
    href: "blood-donors",
    icon: "water-outline",
    titleEn: "Blood Donor Registry",
    titleTa: "இரத்த தான பதிவு",
  },
  {
    href: "organ-donation",
    icon: "heart-outline",
    titleEn: "Organ Donation Pledge",
    titleTa: "உறுப்பு தானம்",
  },
  {
    href: "tree-plantation",
    icon: "leaf-outline",
    titleEn: "Tree Plantation Drive",
    titleTa: "மரம் நடுதல்",
  },
  {
    href: "disaster-relief",
    icon: "umbrella-outline",
    titleEn: "Disaster Relief Volunteers",
    titleTa: "இடர் நிவாரண தொண்டர்கள்",
  },
  {
    href: "food-donation",
    icon: "restaurant-outline",
    titleEn: "Food Donation & Annadanam",
    titleTa: "அன்னதானம்",
  },
  {
    href: "education-support",
    icon: "school-outline",
    titleEn: "Education Support & Tuition",
    titleTa: "கல்வி உதவி",
  },
  {
    href: "elder-care",
    icon: "accessibility-outline",
    titleEn: "Elder & Disability Care",
    titleTa: "மூத்தோர் பராமரிப்பு",
  },
  {
    href: "water-bodies",
    icon: "water",
    titleEn: "Lake & Water Body Restoration",
    titleTa: "ஏரி மீட்பு",
  },
  {
    href: "waste-management",
    icon: "trash-outline",
    titleEn: "Waste Management & Cleanup",
    titleTa: "கழிவு மேலாண்மை",
  },
  {
    href: "animal-welfare",
    icon: "paw-outline",
    titleEn: "Animal Welfare & Strays",
    titleTa: "விலங்கு நலன்",
  },
  {
    href: "skill-training",
    icon: "construct-outline",
    titleEn: "Skill Training & Livelihood",
    titleTa: "திறன் பயிற்சி",
  },
  {
    href: "womens-collective",
    icon: "female-outline",
    titleEn: "Women's Collective",
    titleTa: "பெண்கள் சங்கம்",
  },
  {
    href: "youth-clubs",
    icon: "football-outline",
    titleEn: "Youth Clubs & Sports",
    titleTa: "இளைஞர் சங்கம்",
  },
  {
    href: "library-circles",
    icon: "library-outline",
    titleEn: "Reading Circles & Libraries",
    titleTa: "நூலக வட்டம்",
  },
  {
    href: "health-camps",
    icon: "medkit-outline",
    titleEn: "Health Camps & Clinics",
    titleTa: "மருத்துவ முகாம்",
  },
  {
    href: "mental-health",
    icon: "happy-outline",
    titleEn: "Mental Health Support",
    titleTa: "மன நல உதவி",
  },
];

function getSeededPolygon(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  
  const vertices = 9;
  const centerX = 80;
  const centerY = 80;
  const baseRadius = 55;
  
  let path = "";
  
  for (let i = 0; i < vertices; i++) {
    const angle = (i * 2 * Math.PI) / vertices;
    const offsetSeed = (h + i * 179) % 37;
    const offset = (offsetSeed % 16) - 8; // -8 to +8 radius variation
    const r = baseRadius + offset;
    const x = (centerX + r * Math.cos(angle)).toFixed(1);
    const y = (centerY + r * Math.sin(angle)).toFixed(1);
    
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  path += " Z";
  return path;
}

const EELAM_MOCKS: Record<string, { id: string; nameEn: string; nameTa: string; district: string; number: number }> = {
  jaffna: { id: "eelam-jaffna", nameEn: "Jaffna", nameTa: "யாழ்ப்பாணம்", district: "Jaffna District", number: 1 },
  trincomalee: { id: "eelam-trinco", nameEn: "Trincomalee", nameTa: "திருகோணமலை", district: "திருகோணமலை", number: 2 },
  batticaloa: { id: "eelam-batticaloa", nameEn: "Batticaloa", nameTa: "மட்டக்களப்பு", district: "மட்டக்களப்பு", number: 3 },
  vanni: { id: "eelam-vanni", nameEn: "Vanni", nameTa: "வன்னி", district: "Vanni District", number: 4 },
  mannar: { id: "eelam-mannar", nameEn: "Mannar", nameTa: "மன்னார்", district: "Mannar District", number: 5 }
};

export default function Hub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user, profile: userProfile } = useSession();

  const eelamMock = EELAM_MOCKS[code as string];
  const c = (constituencies.find((x: { code: string }) => x.code === code) || eelamMock) as
    | { id: string; code: string; nameEn: string; nameTa: string; district: string; number: number }
    | undefined;

  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const OVERVIEW_HEIGHT = SCREEN_HEIGHT * 0.48;

  // Generate deterministic metrics based on constituency code/id
  let issuesCount = 148;
  let pendingCount = 32;
  let residentsCount = "2.4k";
  let lat = "13.08° N";
  let lng = "80.27° E";

  if (c) {
    let charSum = 0;
    for (let i = 0; i < c.id.length; i++) {
      charSum += c.id.charCodeAt(i);
    }
    issuesCount = 45 + (charSum % 120);
    pendingCount = 5 + (charSum % 28);
    residentsCount = (1.5 + (charSum % 18) / 10).toFixed(1) + "k";
    
    // Tamil Nadu coordinates roughly between 8° N and 14° N latitude, and 76° E and 80° E longitude
    const latVal = 8.5 + (charSum % 55) / 10;
    const lngVal = 76.5 + (charSum % 35) / 10;
    lat = `${latVal.toFixed(2)}° N`;
    lng = `${lngVal.toFixed(2)}° E`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Overview Section */}
      <View
        style={{
          height: OVERVIEW_HEIGHT,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: HAIRLINE,
          paddingTop: insets.top,
        }}
      >
        {/* Top Header Row with Title */}
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: HAIRLINE,
            paddingHorizontal: 8,
          }}
        >
          {c && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                marginLeft: 8,
                marginRight: 4,
              })}
            >
              <Avatar name={c.nameEn} size={36} seed={c.id} />
            </Pressable>
          )}
          
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: TEXT,
                letterSpacing: -0.4,
              }}
              numberOfLines={1}
            >
              {c?.nameEn ?? "Constituency"}
            </Text>
            {c && (
              <Text
                style={{
                  fontSize: 11,
                  color: MUTED,
                  fontWeight: "500",
                  marginTop: 1,
                }}
                numberOfLines={1}
              >
                {c.nameTa} · #{c.number} · {c.district}
              </Text>
            )}
          </View>
          
          <View style={{ alignItems: "flex-end", marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>{residentsCount}</Text>
            <Text style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" }}>Residents</Text>
          </View>
        </View>

        {/* Center: Large Vector Map Visualization */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 160,
              height: 160,
              backgroundColor: SURFACE_ALT,
              borderRadius: 80,
              borderWidth: 1,
              borderColor: HAIRLINE,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {c ? (
              <Svg width="160" height="160" viewBox="0 0 160 160">
                <Path
                  d={getSeededPolygon(c.id)}
                  fill={ACCENT_SOFT}
                  stroke={ACCENT}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <Path
                  d="M 80 80 L 120 40 M 80 80 L 40 100 M 80 80 L 90 130"
                  stroke="#AECBFA"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
                <Circle cx="80" cy="80" r="8" fill={ACCENT} opacity={0.25} />
                <Circle cx="80" cy="80" r="4.5" fill={ACCENT} />
              </Svg>
            ) : (
              <ActivityIndicator size="small" color={ACCENT} />
            )}
          </View>
        </View>

        {/* Minimal KPI Row (Issues, Pending) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>{issuesCount}</Text>
            <Text style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2, fontWeight: "600" }}>Issues</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: ACCENT }}>{pendingCount}</Text>
            <Text style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2, fontWeight: "600" }}>Pending</Text>
          </View>
        </View>
      </View>

      {/* 40% Screen Height Scrollable Actions Section */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 10,
            color: MUTED,
            fontWeight: "700",
            letterSpacing: 1.2,
            marginTop: 20,
            marginBottom: 8,
            marginHorizontal: 20,
            textTransform: "uppercase",
          }}
        >
          Constituency Tools
        </Text>

        {ALL_TOOLS.map((m) => (
          <Pressable
            key={m.href}
            onPress={() => router.push(`/spacetools/constituency/${m.href}` as any)}
            android_ripple={{ color: SURFACE_HOVER }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? SURFACE_HOVER : "white",
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 0.5,
              borderBottomColor: HAIRLINE,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: ACCENT_SOFT,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name={m.icon} size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: TEXT,
                  fontWeight: "500",
                  letterSpacing: 0.1,
                }}
              >
                {m.titleEn}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: MUTED,
                  marginTop: 2,
                }}
              >
                {m.titleTa}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </Pressable>
        ))}

        <Text
          style={{
            fontSize: 10,
            color: MUTED,
            fontWeight: "700",
            letterSpacing: 1.2,
            marginTop: 28,
            marginBottom: 8,
            marginHorizontal: 20,
            textTransform: "uppercase",
          }}
        >
          Community Tools
        </Text>

        {COMMUNITY_TOOLS.map((m) => (
          <Pressable
            key={m.href}
            onPress={() => router.push(`/spacetools/community/${m.href}` as any)}
            android_ripple={{ color: SURFACE_HOVER }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? SURFACE_HOVER : "white",
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 0.5,
              borderBottomColor: HAIRLINE,
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: ACCENT_SOFT,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name={m.icon} size={18} color={ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: TEXT,
                  fontWeight: "500",
                  letterSpacing: 0.1,
                }}
              >
                {m.titleEn}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: MUTED,
                  marginTop: 2,
                }}
              >
                {m.titleTa}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={MUTED} />
          </Pressable>
        ))}

        {/* Small minimalist footer with horizontal layout */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 32,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: ACCENT_SOFT,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <BrandLogo size={14} color={ACCENT} />
          </View>
          
          <Text
            style={{
              fontSize: 9,
              color: MUTED,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            thamizh AI governance
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
