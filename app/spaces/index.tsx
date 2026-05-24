import { Ionicons } from "@expo/vector-icons";
import { Stack, Link, Redirect, useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { db } from "@/lib/db";
import { useSession } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import BrandLogo from "@/lib/BrandLogo";
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_SOFT,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
} from "@/lib/theme";

type Row = {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  district: string;
  number: number;
  reservation?: string;
  messages: { id: string; body: string; createdAt: number }[];
};

type Tab = "feed" | "chats" | "spaces";

const EELAM_CONSTITUENCIES: Row[] = [
  {
    id: "eelam-jaffna",
    code: "jaffna",
    slug: "jaffna",
    nameEn: "Jaffna",
    nameTa: "யாழ்ப்பாணம்",
    district: "Jaffna District",
    number: 1,
    messages: [],
  },
  {
    id: "eelam-trinco",
    code: "trincomalee",
    slug: "trincomalee",
    nameEn: "Trincomalee",
    nameTa: "திருகோணமலை",
    district: "Trincomalee District",
    number: 2,
    messages: [],
  },
  {
    id: "eelam-batticaloa",
    code: "batticaloa",
    slug: "batticaloa",
    nameEn: "Batticaloa",
    nameTa: "மட்டக்களப்பு",
    district: "Batticaloa District",
    number: 3,
    messages: [],
  },
  {
    id: "eelam-vanni",
    code: "vanni",
    slug: "vanni",
    nameEn: "Vanni",
    nameTa: "வன்னி",
    district: "Vanni District",
    number: 4,
    messages: [],
  },
  {
    id: "eelam-mannar",
    code: "mannar",
    slug: "mannar",
    nameEn: "Mannar",
    nameTa: "மன்னார்",
    district: "Mannar District",
    number: 5,
    messages: [],
  },
  {
    id: "eelam-malayagam",
    code: "malayagam",
    slug: "malayagam",
    nameEn: "Malayagam",
    nameTa: "மலையகம்",
    district: "Hill Country",
    number: 6,
    messages: [],
  },
  {
    id: "eelam-diaspora",
    code: "diaspora",
    slug: "diaspora",
    nameEn: "Eelam Diaspora",
    nameTa: "ஈழப் புலம்பெயர்",
    district: "Worldwide",
    number: 7,
    messages: [],
  },
];

export default function ConstituenciesIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading: sessionLoading, user, profile, constituency } = useSession();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("spaces");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState<"Tamilnadu" | "Eelam">("Tamilnadu");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bskyPosts, setBskyPosts] = useState<any[]>([]);
  const [bskyLoading, setBskyLoading] = useState(false);
  const [bskyUntil, setBskyUntil] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (tab !== "feed") return;

    let active = true;
    const fetchFeed = async () => {
      setBskyLoading(true);
      setBskyUntil(null);
      try {
        const q = activeLocation === "Tamilnadu" ? "tamilnadu" : "eelam";
        const res = await fetch(
          `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&limit=30`
        );
        const json = await res.json();
        if (active && json.posts) {
          setBskyPosts(json.posts);
          if (json.posts.length > 0) {
            const oldest = json.posts[json.posts.length - 1];
            const oldestDate = oldest.record?.createdAt || oldest.indexedAt;
            setBskyUntil(oldestDate || null);
          } else {
            setBskyUntil(null);
          }
        }
      } catch (err) {
        console.error("Error fetching Bluesky feed:", err);
      } finally {
        if (active) setBskyLoading(false);
      }
    };

    fetchFeed();
    return () => {
      active = false;
    };
  }, [activeLocation, tab]);

  const loadMore = async () => {
    if (loadingMore || !bskyUntil || tab !== "feed") return;
    setLoadingMore(true);
    try {
      const q = activeLocation === "Tamilnadu" ? "tamilnadu" : "eelam";
      const res = await fetch(
        `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&limit=30&until=${encodeURIComponent(bskyUntil)}`
      );
      const json = await res.json();
      if (json.posts && json.posts.length > 0) {
        setBskyPosts((prev) => {
          const existingUris = new Set(prev.map(p => p.uri));
          const filteredNew = json.posts.filter((p: any) => !existingUris.has(p.uri));
          return [...prev, ...filteredNew];
        });
        const oldest = json.posts[json.posts.length - 1];
        const oldestDate = oldest.record?.createdAt || oldest.indexedAt;
        setBskyUntil(oldestDate || null);
      } else {
        setBskyUntil(null);
      }
    } catch (err) {
      console.error("Error loading more Bluesky posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("@pinned_spaces").then((val) => {
      if (val) {
        setPinnedIds(JSON.parse(val));
      }
    });
  }, []);

  const togglePin = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const next = pinnedIds.includes(id)
      ? pinnedIds.filter((x) => x !== id)
      : [...pinnedIds, id];
    setPinnedIds(next);
    await AsyncStorage.setItem("@pinned_spaces", JSON.stringify(next));
  };

  const { data, isLoading: listLoading } = db.useQuery({
    constituencies: {
      $: { order: { number: "asc" } },
      messages: { $: { order: { createdAt: "desc" } } },
    },
  });

  const { data: feedData, isLoading: feedLoading } = db.useQuery({
    messages: {
      $: { order: { createdAt: "desc" }, limit: 40 },
      author: {},
      constituency: {},
    },
  });

  const rows = useMemo(() => {
    if (activeLocation === "Eelam") {
      return EELAM_CONSTITUENCIES;
    }
    return (data?.constituencies ?? []) as Row[];
  }, [data, activeLocation]);

  const feedMessages = useMemo(() => {
    if (activeLocation === "Eelam") {
      return [
        {
          id: "eelam-msg-1",
          body: "Jaffna AI Node started local economic planning. Register for the agricultural cooperative registry.",
          createdAt: Date.now() - 3600000 * 2,
          author: { id: "author-1", displayName: "Tharman S." },
          constituency: { code: "jaffna", nameEn: "Jaffna" }
        },
        {
          id: "eelam-msg-2",
          body: "Trincomalee social audit on land rights distribution is now complete. Review results in the audit ledger.",
          createdAt: Date.now() - 3600000 * 5,
          author: { id: "author-2", displayName: "Kayalvili K." },
          constituency: { code: "trincomalee", nameEn: "Trincomalee" }
        },
        {
          id: "eelam-msg-3",
          body: "Public discussion on the setup of local language councils in Batticaloa starts tonight at 7 PM.",
          createdAt: Date.now() - 3600000 * 12,
          author: { id: "author-3", displayName: "Sanjeev M." },
          constituency: { code: "batticaloa", nameEn: "Batticaloa" }
        }
      ] as any[];
    }
    return (feedData?.messages ?? []) as any[];
  }, [feedData, activeLocation]);

  const ordered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          (r) =>
            r.nameEn.toLowerCase().includes(q) ||
            (r.nameTa ?? "").toLowerCase().includes(q) ||
            r.district.toLowerCase().includes(q) ||
            String(r.number) === q,
        )
      : rows;

    const pinned = filtered.filter((r) => pinnedIds.includes(r.id));
    const unpinned = filtered.filter((r) => !pinnedIds.includes(r.id));

    // Sort pinned by number
    pinned.sort((a, b) => a.number - b.number);

    // For unpinned, if constituency exists, put it first in the unpinned list
    if (constituency) {
      const myIdx = unpinned.findIndex((r) => r.id === constituency.id);
      if (myIdx >= 0) {
        const mine = unpinned[myIdx];
        unpinned.splice(myIdx, 1);
        unpinned.unshift(mine);
      }
    }

    return [...pinned, ...unpinned];
  }, [rows, query, pinnedIds, constituency]);

  if (sessionLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }
  if (!user) return <Redirect href="/sign-in" />;
  if (!profile?.constituency) return <Redirect href="/pick-constituency" />;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Bottom Drawer for Community Selection */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable
          onPress={() => setDropdownOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            }}
          >
            {/* Drawer grabber */}
            <View
              style={{
                alignSelf: "center",
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: HAIRLINE,
                marginTop: 6,
                marginBottom: 10,
              }}
            />

            <Pressable
              onPress={() => {
                setActiveLocation("Eelam");
                setDropdownOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: pressed ? SURFACE_HOVER : "transparent",
                borderBottomWidth: 0.5,
                borderBottomColor: HAIRLINE,
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: activeLocation === "Eelam" ? "600" : "500",
                  color: activeLocation === "Eelam" ? ACCENT : TEXT,
                }}
              >
                Eelam
              </Text>
              {activeLocation === "Eelam" ? (
                <Ionicons name="checkmark" size={18} color={ACCENT} />
              ) : null}
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveLocation("Tamilnadu");
                setDropdownOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: pressed ? SURFACE_HOVER : "transparent",
              })}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: activeLocation === "Tamilnadu" ? "600" : "500",
                  color: activeLocation === "Tamilnadu" ? ACCENT : TEXT,
                }}
              >
                Tamil Nadu
              </Text>
              {activeLocation === "Tamilnadu" ? (
                <Ionicons name="checkmark" size={18} color={ACCENT} />
              ) : null}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Top brand header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: ACCENT_SOFT,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrandLogo size={22} color={ACCENT} />
          </View>
          
          <Pressable
            onPress={() => setDropdownOpen(true)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
              marginLeft: 10,
            })}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: TEXT,
                letterSpacing: -0.4,
              }}
            >
              {activeLocation === "Tamilnadu" ? "Tamil Nadu" : "Eelam"}
            </Text>
            <Ionicons name="chevron-down" size={14} color={TEXT} style={{ marginLeft: 5, marginTop: 1 }} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push("/profile");
          }}
          hitSlop={8}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Avatar
            name={profile?.displayName ?? user.email ?? "Me"}
            size={34}
            seed={user.id}
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      {tab === "spaces" ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            backgroundColor: "white",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: SURFACE_ALT,
              borderRadius: 20,
              height: 40,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="search" size={16} color={MUTED} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search spaces or districts..."
              placeholderTextColor={MUTED}
              autoCorrect={false}
              autoCapitalize="none"
              style={{
                flex: 1,
                height: 40,
                paddingHorizontal: 8,
                color: TEXT,
                fontSize: 14,
              }}
            />
            {query ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                style={{ padding: 2 }}
              >
                <Ionicons name="close-circle" size={16} color={MUTED} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {tab === "feed" ? (
        <FlatList
          style={{ flex: 1 }}
          data={bskyPosts}
          keyExtractor={(item) => item.uri}
          refreshing={bskyLoading}
          onRefresh={async () => {
            setBskyLoading(true);
            try {
              const q = activeLocation === "Tamilnadu" ? "tamilnadu" : "eelam";
              const res = await fetch(
                `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(q)}&limit=30`
              );
              const json = await res.json();
              if (json.posts) {
                setBskyPosts(json.posts);
                if (json.posts.length > 0) {
                  const oldest = json.posts[json.posts.length - 1];
                  const oldestDate = oldest.record?.createdAt || oldest.indexedAt;
                  setBskyUntil(oldestDate || null);
                } else {
                  setBskyUntil(null);
                }
              }
            } catch (err) {
              console.error("Error refreshing Bluesky feed:", err);
            } finally {
              setBskyLoading(false);
            }
          }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 96,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 64 }}>
              {bskyLoading ? (
                <ActivityIndicator color={ACCENT} />
              ) : (
                <Text style={{ fontSize: 13, color: MUTED }}>No updates in feed yet.</Text>
              )}
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator color={ACCENT} />
              </View>
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <BskyFeedCard item={item} />
          )}
        />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={tab === "spaces" ? ordered : []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{
            paddingVertical: 4,
            paddingBottom: insets.bottom + 96,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                paddingTop: 64,
                alignItems: "center",
                paddingHorizontal: 32,
              }}
            >
              {listLoading ? (
                <ActivityIndicator color={ACCENT} />
              ) : tab === "chats" ? (
                <>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: SURFACE_ALT,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={28} color={MUTED} />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: TEXT,
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    No direct messages yet
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: MUTED,
                      textAlign: "center",
                      marginTop: 6,
                      lineHeight: 18,
                    }}
                  >
                    Switch to Spaces to join your constituency conversation.
                  </Text>
                </>
              ) : (
                <Text style={{ fontSize: 13, color: MUTED }}>No spaces</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <ChatRow
              row={item}
              mine={item.id === constituency?.id}
              isPinned={pinnedIds.includes(item.id)}
              onLongPress={() => togglePin(item.id)}
            />
          )}
        />
      )}

      {/* Bottom Navigation Bar */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: HAIRLINE,
          backgroundColor: "white",
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 8,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + Math.max(insets.bottom, 12),
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <NavButton
          label="Spaces"
          icon={tab === "spaces" ? "planet" : "planet-outline"}
          active={tab === "spaces"}
          onPress={() => setTab("spaces")}
        />
        <NavButton
          label="Feed"
          icon="#"
          active={tab === "feed"}
          onPress={() => setTab("feed")}
        />
        <NavButton
          label="Chats"
          icon={tab === "chats" ? "chatbubble" : "chatbubble-outline"}
          active={tab === "chats"}
          onPress={() => setTab("chats")}
        />
      </View>
    </View>
  );
}

function NavButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap | "#";
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: 48,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon === "#" ? (
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: active ? ACCENT : MUTED,
            height: 22,
            lineHeight: 22,
            marginBottom: 2,
          }}
        >
          #
        </Text>
      ) : (
        <Ionicons
          name={icon as any}
          size={22}
          color={active ? ACCENT : MUTED}
          style={{ marginBottom: 2 }}
        />
      )}
      <Text
        style={{
          fontSize: 10,
          color: active ? ACCENT : MUTED,
          fontWeight: active ? "600" : "500",
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FeedCard({ item }: { item: any }) {
  const router = useRouter();
  
  return (
    <View
      style={{
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: HAIRLINE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header: Author & Timestamp */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar name={item.author?.displayName ?? "Anonymous"} size={32} seed={item.author?.id ?? "unknown"} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT }}>
              {item.author?.displayName ?? "Anonymous User"}
            </Text>
            <Text style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Constituency Badge */}
        {item.constituency ? (
          <Pressable
            onPress={() => router.push(`/spaces/${item.constituency.code}`)}
            style={({ pressed }) => ({
              backgroundColor: ACCENT_SOFT,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 11, color: ACCENT, fontWeight: "600" }}>
              #{item.constituency.nameEn}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Body text */}
      <Text
        style={{
          fontSize: 14,
          color: TEXT,
          lineHeight: 20,
          marginTop: 12,
          letterSpacing: 0.1,
        }}
      >
        {item.body}
      </Text>

      {/* Footer Mocks: Like/Comment */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 0.5,
          borderTopColor: HAIRLINE,
          alignItems: "center",
        }}
      >
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", marginRight: 24 }}
          hitSlop={6}
        >
          <Ionicons name="heart-outline" size={16} color={MUTED} />
          <Text style={{ fontSize: 12, color: MUTED, marginLeft: 4, fontWeight: "500" }}>
            Upvote
          </Text>
        </Pressable>
        
        <Pressable
          style={{ flexDirection: "row", alignItems: "center" }}
          hitSlop={6}
        >
          <Ionicons name="chatbubble-outline" size={15} color={MUTED} style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 12, color: MUTED, marginLeft: 4, fontWeight: "500" }}>
            Discuss
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const LINK_BLUE = "#1d9bf0";

function shortenUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const tail = (host + path).replace(/\/$/, "");
    return tail.length > 28 ? tail.slice(0, 27) + "…" : tail;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "");
  }
}

function renderRichText(text: string, stripUrl?: string) {
  const parts = text.split(/(#[\p{L}\p{N}_]+|@[\w.-]+|https?:\/\/\S+)/gu);
  return parts.map((part, i) => {
    if (!part) return null;
    if (/^https?:\/\//.test(part)) {
      if (stripUrl && part.replace(/\/$/, "") === stripUrl.replace(/\/$/, "")) {
        return null;
      }
      return (
        <Text key={i} style={{ color: LINK_BLUE }}>
          {shortenUrl(part)}
        </Text>
      );
    }
    if (part[0] === "#" || part[0] === "@") {
      return (
        <Text key={i} style={{ color: LINK_BLUE }}>
          {part}
        </Text>
      );
    }
    return part;
  });
}

function BskyFeedCard({ item }: { item: any }) {
  const author = item.author || {};
  const record = item.record || {};
  const createdAt = Date.parse(record.createdAt || item.indexedAt || "");
  const timeLabel = isNaN(createdAt) ? "" : formatTimestamp(createdAt);
  const displayName = author.displayName || author.handle || "Bluesky User";
  const handle = author.handle || "handle";

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: HAIRLINE,
        backgroundColor: "white",
      }}
    >
      {/* Avatar column */}
      <View style={{ width: 40, marginRight: 12 }}>
        {author.avatar ? (
          <Image
            source={{ uri: author.avatar }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: SURFACE_ALT }}
          />
        ) : (
          <Avatar name={displayName} size={40} seed={author.did || "bsky"} />
        )}
      </View>

      {/* Content column */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Header line: name · @handle · time */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: "700", color: TEXT, maxWidth: "55%" }}
          >
            {displayName}
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontSize: 13, color: MUTED, marginLeft: 4, flexShrink: 1 }}
          >
            @{handle}
          </Text>
          {timeLabel ? (
            <>
              <Text style={{ fontSize: 13, color: MUTED, marginHorizontal: 4 }}>·</Text>
              <Text style={{ fontSize: 13, color: MUTED }}>{timeLabel}</Text>
            </>
          ) : null}
        </View>

        {/* Body */}
        {record.text ? (
          <Text style={{ fontSize: 14, color: TEXT, lineHeight: 19, marginTop: 2 }}>
            {renderRichText(record.text, item.embed?.external?.uri)}
          </Text>
        ) : null}

        {/* Embedded image */}
        {item.embed?.images?.[0]?.thumb ? (
          <Image
            source={{ uri: item.embed.images[0].thumb }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 14,
              marginTop: 8,
              backgroundColor: SURFACE_ALT,
              borderWidth: 0.5,
              borderColor: HAIRLINE,
            }}
            resizeMode="cover"
          />
        ) : null}

        {/* External link card */}
        {item.embed?.external ? (
          <View
            style={{
              marginTop: 8,
              borderWidth: 0.5,
              borderColor: HAIRLINE,
              borderRadius: 10,
              overflow: "hidden",
              backgroundColor: "white",
              flexDirection: "row",
              alignItems: "stretch",
            }}
          >
            {item.embed.external.thumb ? (
              <Image
                source={{ uri: item.embed.external.thumb }}
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: SURFACE_ALT,
                }}
                resizeMode="cover"
              />
            ) : null}
            <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 8, justifyContent: "center" }}>
              {item.embed.external.title ? (
                <Text
                  style={{ fontSize: 13, color: TEXT, fontWeight: "500" }}
                  numberOfLines={1}
                >
                  {item.embed.external.title}
                </Text>
              ) : null}
              <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }} numberOfLines={1}>
                {shortenUrl(item.embed.external.uri)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Action row */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 8,
            marginLeft: -6,
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 320,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="chatbubble-outline" size={15} color={MUTED} />
            <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
              {item.replyCount ?? 0}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="repeat-outline" size={16} color={MUTED} />
            <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
              {item.repostCount ?? 0}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="heart-outline" size={15} color={MUTED} />
            <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
              {item.likeCount ?? 0}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="share-outline" size={15} color={MUTED} />
          </View>
        </View>
      </View>
    </View>
  );
}

function ChatRow({
  row,
  mine,
  isPinned,
  onLongPress,
}: {
  row: Row;
  mine: boolean;
  isPinned: boolean;
  onLongPress: () => void;
}) {
  const router = useRouter();
  const last = row.messages?.[0];
  return (
    <Pressable
      onPress={() => router.push(`/spaces/${row.code}`)}
      onLongPress={onLongPress}
      android_ripple={{ color: SURFACE_HOVER }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? SURFACE_HOVER : isPinned ? SURFACE_ALT : "white",
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
      })}
    >
      <Avatar name={row.nameEn} size={44} seed={row.id} />

      <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 15,
              color: TEXT,
              fontWeight: mine ? "600" : "500",
              letterSpacing: 0.1,
            }}
          >
            {row.nameEn}
          </Text>
          {last ? (
            <Text
              style={{
                fontSize: 12,
                color: MUTED,
                marginLeft: 8,
              }}
            >
              {formatTimestamp(last.createdAt)}
            </Text>
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            color: MUTED,
            marginTop: 3,
            letterSpacing: 0.1,
          }}
        >
          {last?.body ?? `#${row.number} · ${row.district}`}
        </Text>
      </View>
    </Pressable>
  );
}

function formatTimestamp(t: number) {
  const d = new Date(t);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear) {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString([], { year: "numeric", month: "short" });
}
