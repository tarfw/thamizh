import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, Redirect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
  Platform,
  Clipboard,
  Linking,
} from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { disconnect } from "@/lib/db";
import { useSession } from "@/lib/auth";
import { signOutBluesky } from "@/lib/bluesky-auth";
import {
  fetchMyProfile,
  fetchAuthorFeed,
  fetchMyLikes,
  updateMyProfile,
  type BskyProfile,
  type BskyFeedItem,
} from "@/lib/bluesky-api";
import Avatar from "@/lib/Avatar";
import {
  ACCENT,
  ACCENT_SOFT,
  BORDER_IDLE,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
  TEXT_SECONDARY,
  DANGER,
} from "@/lib/theme";

type TabKey = "posts" | "replies" | "media" | "likes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "posts", label: "Posts" },
  { key: "replies", label: "Replies" },
  { key: "media", label: "Media" },
  { key: "likes", label: "Likes" },
];

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (n < 1_000_000) return Math.round(n / 1000) + "k";
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
}

function formatRelative(iso: string): string {
  const ms = new Date(iso).getTime();
  if (!ms) return "";
  const diff = Date.now() - ms;
  if (diff < 0) return "now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatJoinDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading: sessionLoading, user } = useSession();

  const [showDrawer, setShowDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [bskyProfile, setBskyProfile] = useState<BskyProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [posts, setPosts] = useState<BskyFeedItem[]>([]);
  const [replies, setReplies] = useState<BskyFeedItem[]>([]);
  const [media, setMedia] = useState<BskyFeedItem[]>([]);
  const [likes, setLikes] = useState<BskyFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setProfileError(null);
      const p = await fetchMyProfile();
      setBskyProfile(p);
    } catch (e: any) {
      setProfileError(e?.message ?? "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadTab = useCallback(async (tab: TabKey) => {
    setFeedLoading(true);
    try {
      if (tab === "posts") {
        setPosts(await fetchAuthorFeed("posts_no_replies", 50));
      } else if (tab === "replies") {
        const feed = await fetchAuthorFeed("posts_with_replies", 50);
        setReplies(feed.filter((p) => p.isReply));
      } else if (tab === "media") {
        setMedia(await fetchAuthorFeed("posts_with_media", 50));
      } else if (tab === "likes") {
        setLikes(await fetchMyLikes(50));
      }
    } catch {
      // soft-fail; the per-tab list just stays empty
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadTab(activeTab)]);
    setRefreshing(false);
  }, [loadProfile, loadTab, activeTab]);

  const copyDid = () => {
    if (!bskyProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Clipboard.setString(bskyProfile.did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openOnBluesky = () => {
    if (!bskyProfile) return;
    Linking.openURL(`https://bsky.app/profile/${bskyProfile.handle}`).catch(
      () => {}
    );
  };

  const openEdit = () => {
    if (!bskyProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEditName(bskyProfile.displayName ?? "");
    setEditBio(bskyProfile.description ?? "");
    setEditError(null);
    setShowDrawer(false);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!bskyProfile) return;
    const name = editName.trim();
    const bio = editBio.trim();

    if (name.length > 64) {
      setEditError("Display name must be 64 characters or fewer.");
      return;
    }
    if (bio.length > 256) {
      setEditError("Bio must be 256 characters or fewer.");
      return;
    }

    setSaving(true);
    setEditError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      await updateMyProfile({ displayName: name, description: bio });
      setBskyProfile({
        ...bskyProfile,
        displayName: name || bskyProfile.handle,
        description: bio,
      });
      // Re-fetch in the background so server-side normalizations land.
      loadProfile();
      setIsEditing(false);
    } catch (e: any) {
      setEditError(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSigningOut(true);
    try {
      await signOutBluesky();
      await disconnect();
      router.replace("/sign-in");
    } catch {
      router.replace("/sign-in");
    } finally {
      setSigningOut(false);
    }
  };

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

  if (loadingProfile && !bskyProfile) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={ACCENT} />
        <Text style={{ marginTop: 12, color: MUTED, fontSize: 13 }}>
          Loading your Bluesky profile…
        </Text>
      </View>
    );
  }

  if (!bskyProfile) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: 32,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="cloud-offline-outline" size={36} color={MUTED} />
        <Text
          style={{
            marginTop: 12,
            color: TEXT,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {profileError ?? "Couldn't load your Bluesky profile."}
        </Text>
        <Pressable
          onPress={loadProfile}
          style={({ pressed }) => ({
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: pressed ? "#1557b0" : ACCENT,
          })}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const currentFeed: BskyFeedItem[] =
    activeTab === "posts"
      ? posts
      : activeTab === "replies"
      ? replies
      : activeTab === "media"
      ? media
      : likes;

  const emptyMessages: Record<TabKey, { icon: keyof typeof Ionicons.glyphMap; text: string }> = {
    posts: {
      icon: "chatbubbles-outline",
      text: "No posts yet.",
    },
    replies: {
      icon: "return-down-back-outline",
      text: "No replies yet.",
    },
    media: {
      icon: "image-outline",
      text: "No media posts yet.",
    },
    likes: {
      icon: "heart-outline",
      text: "No likes yet.",
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={currentFeed}
        keyExtractor={(item) => item.uri}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ACCENT}
          />
        }
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={{ backgroundColor: "white" }}>
            {/* Banner */}
            <View
              style={{
                height: 150,
                backgroundColor: ACCENT_SOFT,
                position: "relative",
              }}
            >
              {bskyProfile.banner ? (
                <Image
                  source={{ uri: bskyProfile.banner }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : null}

              {/* Back */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light
                  ).catch(() => {});
                  router.back();
                }}
                hitSlop={8}
                style={({ pressed }) => ({
                  position: "absolute",
                  top: insets.top + 8,
                  left: 12,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                  zIndex: 10,
                })}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </Pressable>

              {/* Share + more */}
              <View
                style={{
                  position: "absolute",
                  top: insets.top + 8,
                  right: 12,
                  flexDirection: "row",
                  gap: 8,
                  zIndex: 10,
                }}
              >
                <Pressable
                  onPress={openOnBluesky}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Ionicons name="open-outline" size={18} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light
                    ).catch(() => {});
                    setShowDrawer(true);
                  }}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color="white"
                  />
                </Pressable>
              </View>
            </View>

            {/* Profile header */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              {/* Avatar + Edit Profile */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginTop: -48,
                  marginBottom: 12,
                }}
              >
                {bskyProfile.avatar ? (
                  <Image
                    source={{ uri: bskyProfile.avatar }}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 46,
                      borderWidth: 4,
                      borderColor: "white",
                      backgroundColor: SURFACE_ALT,
                    }}
                  />
                ) : (
                  <Avatar
                    name={bskyProfile.displayName}
                    size={92}
                    seed={bskyProfile.did}
                    style={{ borderWidth: 4, borderColor: "white" }}
                  />
                )}

                <Pressable
                  onPress={openEdit}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? "#1557b0" : ACCENT,
                    flexDirection: "row",
                  })}
                >
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "white" }}
                  >
                    Edit Profile
                  </Text>
                </Pressable>
              </View>

              {/* Display name */}
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: TEXT,
                  letterSpacing: -0.4,
                }}
                numberOfLines={2}
              >
                {bskyProfile.displayName}
              </Text>

              {/* Handle */}
              <Text
                style={{
                  fontSize: 14,
                  color: MUTED,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                @{bskyProfile.handle}
              </Text>

              {/* Bio */}
              {bskyProfile.description ? (
                <Text
                  style={{
                    fontSize: 14,
                    color: TEXT_SECONDARY,
                    lineHeight: 20,
                    marginTop: 12,
                  }}
                >
                  {bskyProfile.description}
                </Text>
              ) : null}

              {/* Joined */}
              {bskyProfile.createdAt ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={MUTED}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ fontSize: 13, color: MUTED }}>
                    Joined {formatJoinDate(bskyProfile.createdAt)}
                  </Text>
                </View>
              ) : null}

              {/* Real stats */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                <Pressable
                  onPress={openOnBluesky}
                  hitSlop={4}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={{ fontSize: 14, color: TEXT_SECONDARY }}>
                    <Text style={{ fontWeight: "700", color: TEXT }}>
                      {formatCount(bskyProfile.followsCount)}
                    </Text>
                    {"  "}
                    <Text style={{ color: MUTED }}>following</Text>
                  </Text>
                </Pressable>
                <Pressable
                  onPress={openOnBluesky}
                  hitSlop={4}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={{ fontSize: 14, color: TEXT_SECONDARY }}>
                    <Text style={{ fontWeight: "700", color: TEXT }}>
                      {formatCount(bskyProfile.followersCount)}
                    </Text>
                    {"  "}
                    <Text style={{ color: MUTED }}>
                      {bskyProfile.followersCount === 1
                        ? "follower"
                        : "followers"}
                    </Text>
                  </Text>
                </Pressable>
                <View>
                  <Text style={{ fontSize: 14, color: TEXT_SECONDARY }}>
                    <Text style={{ fontWeight: "700", color: TEXT }}>
                      {formatCount(bskyProfile.postsCount)}
                    </Text>
                    {"  "}
                    <Text style={{ color: MUTED }}>
                      {bskyProfile.postsCount === 1 ? "post" : "posts"}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Tab bar */}
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: HAIRLINE,
                backgroundColor: "white",
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <Pressable
                      key={tab.key}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setActiveTab(tab.key);
                      }}
                      style={({ pressed }) => ({
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? "700" : "500",
                          color: isActive ? TEXT : MUTED,
                        }}
                      >
                        {tab.label}
                      </Text>
                      {isActive ? (
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            right: 16,
                            bottom: 0,
                            height: 3,
                            backgroundColor: ACCENT,
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2,
                          }}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          feedLoading ? (
            <View style={{ paddingVertical: 48, alignItems: "center" }}>
              <ActivityIndicator color={ACCENT} />
            </View>
          ) : (
            <View
              style={{
                paddingVertical: 64,
                paddingHorizontal: 32,
                alignItems: "center",
              }}
            >
              <Ionicons
                name={emptyMessages[activeTab].icon}
                size={36}
                color={MUTED}
                style={{ marginBottom: 12 }}
              />
              <Text style={{ fontSize: 13, color: MUTED, textAlign: "center" }}>
                {emptyMessages[activeTab].text}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => <PostRow item={item} />}
      />

      {/* Drawer */}
      <Modal
        visible={showDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDrawer(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            onPress={() => setShowDrawer(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />

          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingHorizontal: 20,
              paddingBottom: Math.max(insets.bottom, 20) + 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: HAIRLINE,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: TEXT,
                marginBottom: 16,
              }}
            >
              Settings & Account
            </Text>

            <View style={{ gap: 4, marginBottom: 24 }}>
              <Pressable
                onPress={openEdit}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? SURFACE_HOVER : "transparent",
                })}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={TEXT}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 14, fontWeight: "500", color: TEXT }}>
                  Edit Profile
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowDrawer(false);
                  openOnBluesky();
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? SURFACE_HOVER : "transparent",
                })}
              >
                <Ionicons
                  name="open-outline"
                  size={18}
                  color={TEXT}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 14, fontWeight: "500", color: TEXT }}>
                  View on Bluesky
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowDrawer(false);
                  router.back();
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? SURFACE_HOVER : "transparent",
                })}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={18}
                  color={TEXT}
                  style={{ marginRight: 12 }}
                />
                <Text style={{ fontSize: 14, fontWeight: "500", color: TEXT }}>
                  Go Back
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSignOut}
                disabled={signingOut}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#FDEDEC" : "transparent",
                  opacity: signingOut ? 0.5 : 1,
                })}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={DANGER}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{ fontSize: 14, fontWeight: "500", color: DANGER }}
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: HAIRLINE,
                paddingTop: 16,
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Account Information
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 11, color: MUTED }}>Handle</Text>
                <Text style={{ fontSize: 12, color: TEXT, fontWeight: "500" }}>
                  @{bskyProfile.handle}
                </Text>
              </View>

              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, color: MUTED }}>DID</Text>
                  <Pressable
                    onPress={copyDid}
                    hitSlop={6}
                    style={({ pressed }) => ({
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: pressed ? SURFACE_HOVER : SURFACE_ALT,
                    })}
                  >
                    <Text
                      style={{ fontSize: 10, color: TEXT, fontWeight: "600" }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Text>
                  </Pressable>
                </View>
                <Text
                  selectable
                  style={{
                    fontSize: 11,
                    color: TEXT_SECONDARY,
                    fontFamily:
                      Platform.OS === "ios" ? "Courier" : "monospace",
                    lineHeight: 16,
                  }}
                >
                  {bskyProfile.did}
                </Text>
              </View>

              {bskyProfile.createdAt ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 11, color: MUTED }}>Joined</Text>
                  <Text
                    style={{ fontSize: 12, color: TEXT, fontWeight: "500" }}
                  >
                    {formatJoinDate(bskyProfile.createdAt)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={false}
        onRequestClose={() => (saving ? undefined : setIsEditing(false))}
      >
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}>
          <View
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: HAIRLINE,
            }}
          >
            <Pressable
              onPress={() => !saving && setIsEditing(false)}
              disabled={saving}
              style={({ pressed }) => ({
                opacity: pressed || saving ? 0.5 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: MUTED }}>Cancel</Text>
            </Pressable>

            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>
              Edit Profile
            </Text>

            <Pressable
              onPress={saveEdit}
              disabled={saving}
              style={({ pressed }) => ({
                opacity: pressed || saving ? 0.5 : 1,
              })}
            >
              {saving ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : (
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: ACCENT }}
                >
                  Save
                </Text>
              )}
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            >
              {editError ? (
                <View
                  style={{
                    padding: 12,
                    backgroundColor: "#FDEDEC",
                    borderRadius: 8,
                    marginBottom: 16,
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={DANGER}
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <Text style={{ color: DANGER, fontSize: 13, flex: 1 }}>
                    {editError}
                  </Text>
                </View>
              ) : null}

              {/* Handle (read-only — Bluesky handle changes need separate flow) */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: MUTED,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Handle
                </Text>
                <View
                  style={{
                    height: 44,
                    borderWidth: 1,
                    borderColor: BORDER_IDLE,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    justifyContent: "center",
                    backgroundColor: SURFACE_ALT,
                  }}
                >
                  <Text style={{ fontSize: 15, color: TEXT_SECONDARY }}>
                    @{bskyProfile.handle}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                  Handle changes require domain verification — manage in
                  Bluesky settings.
                </Text>
              </View>

              {/* Display Name */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: MUTED,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Display Name
                  </Text>
                  <Text style={{ fontSize: 11, color: MUTED }}>
                    {editName.length} / 64
                  </Text>
                </View>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={MUTED}
                  maxLength={64}
                  editable={!saving}
                  style={{
                    height: 44,
                    borderWidth: 1,
                    borderColor: BORDER_IDLE,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 15,
                    color: TEXT,
                    backgroundColor: "white",
                  }}
                />
              </View>

              {/* Bio */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: MUTED,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Bio
                  </Text>
                  <Text style={{ fontSize: 11, color: MUTED }}>
                    {editBio.length} / 256
                  </Text>
                </View>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell people about yourself"
                  placeholderTextColor={MUTED}
                  maxLength={256}
                  editable={!saving}
                  multiline
                  numberOfLines={4}
                  style={{
                    minHeight: 100,
                    borderWidth: 1,
                    borderColor: BORDER_IDLE,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingTop: 10,
                    paddingBottom: 10,
                    fontSize: 15,
                    color: TEXT,
                    backgroundColor: "white",
                    textAlignVertical: "top",
                  }}
                />
              </View>

              <Text style={{ fontSize: 11, color: MUTED, lineHeight: 16 }}>
                Changes are saved directly to your Bluesky profile and will
                appear everywhere on the network.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function PostRow({ item }: { item: BskyFeedItem }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: HAIRLINE,
      }}
    >
      {item.isRepost && item.repostedBy ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
            marginLeft: 50,
          }}
        >
          <Ionicons name="repeat" size={12} color={MUTED} />
          <Text style={{ fontSize: 12, color: MUTED, marginLeft: 4 }}>
            Reposted by {item.repostedBy.displayName}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row" }}>
        {item.author.avatar ? (
          <Image
            source={{ uri: item.author.avatar }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: 10,
              backgroundColor: SURFACE_ALT,
            }}
          />
        ) : (
          <Avatar
            name={item.author.displayName}
            size={40}
            seed={item.author.did}
            style={{ marginRight: 10 }}
          />
        )}

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: TEXT }}
              numberOfLines={1}
            >
              {item.author.displayName}
            </Text>
            <Text
              style={{ fontSize: 13, color: MUTED, marginLeft: 6 }}
              numberOfLines={1}
            >
              @{item.author.handle}
            </Text>
            <Text style={{ fontSize: 13, color: MUTED, marginLeft: 6 }}>·</Text>
            <Text style={{ fontSize: 13, color: MUTED, marginLeft: 6 }}>
              {formatRelative(item.indexedAt)}
            </Text>
          </View>

          {item.isReply ? (
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              Replying to a post
            </Text>
          ) : null}

          {item.text ? (
            <Text
              style={{
                fontSize: 15,
                color: TEXT,
                lineHeight: 21,
                marginTop: 4,
              }}
            >
              {item.text}
            </Text>
          ) : null}

          {item.images.length > 0 ? (
            <View
              style={{
                marginTop: 8,
                borderRadius: 10,
                overflow: "hidden",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {item.images.slice(0, 4).map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img.thumb }}
                  style={{
                    width: item.images.length === 1 ? "100%" : "49.5%",
                    height: item.images.length === 1 ? 220 : 140,
                    backgroundColor: SURFACE_ALT,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              justifyContent: "space-between",
              paddingRight: 24,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="chatbubble-outline" size={15} color={MUTED} />
              <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
                {formatCount(item.replyCount)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="repeat-outline" size={17} color={MUTED} />
              <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
                {formatCount(item.repostCount)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="heart-outline" size={15} color={MUTED} />
              <Text style={{ fontSize: 12, color: MUTED, marginLeft: 6 }}>
                {formatCount(item.likeCount)}
              </Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={15} color={MUTED} />
          </View>
        </View>
      </View>
    </View>
  );
}
