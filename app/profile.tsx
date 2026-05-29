import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, Redirect } from "expo-router";
import { useState, useMemo } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { callReducer, ts } from "@/lib/db";
import { useSession } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_SOFT,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
  TEXT_SECONDARY,
  BORDER_IDLE,
  DANGER,
} from "@/lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading: sessionLoading, user, profile, constituency } = useSession();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  // Query this user's posts
  const { messages: allMessages } = useSpacetimeDB();

  const posts = useMemo(() => {
    if (!profile) return [];
    return allMessages
      .filter((m) => m.sender.toHexString() === profile.id)
      .sort((a, b) => ts(b.sent) - ts(a.sent))
      .slice(0, 100)
      .map((m, idx) => ({
        id: `${m.sender.toHexString()}_${ts(m.sent)}_${idx}`,
        body: m.body,
        createdAt: ts(m.sent),
        author: { id: profile.id, displayName: profile.displayName },
        constituency: m.roomType === "constituency" ? { code: m.roomId, nameEn: m.roomId } : null,
      }));
  }, [allMessages, profile]);

  const handleEditPress = () => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowDrawer(false); // Close the drawer first
    setEditName(profile.displayName || "");
    setEditHandle(profile.handle || "");
    setEditBio(profile.bio || "");
    setErrorMsg("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    const name = editName.trim();
    const handleVal = editHandle.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    if (!name) {
      setErrorMsg("Display name cannot be empty");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      await callReducer("set_display_name", { displayName: name, handle: handleVal || name });
      setIsEditing(false);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };



  const copyAccountId = () => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Clipboard.setString(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }

  if (!user) return <Redirect href="/sign-in" />;
  if (!profile) return null;


  const displayHandle = profile.handle 
    ? `@${profile.handle}.tamilatchi.org`
    : `@${profile.displayName.toLowerCase().replace(/\s+/g, "")}.tamilatchi.org`;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Main Profile Feed */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* Cover Banner */}
            <View
              style={{
                height: 130,
                backgroundColor: ACCENT_SOFT,
                position: "relative",
              }}
            >
              {/* Options Menu Button (Three-Dot) */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowDrawer(true);
                }}
                hitSlop={8}
                style={({ pressed }) => ({
                  position: "absolute",
                  top: insets.top + 6,
                  right: 12,
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                  zIndex: 10,
                })}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="white" />
              </Pressable>
            </View>

            {/* Profile Info Section */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
              {/* Avatar overlapping the banner */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: -42,
                  marginBottom: 10,
                }}
              >
                <Avatar
                  name={profile.displayName}
                  size={84}
                  seed={profile.id}
                  style={{
                    borderWidth: 4,
                    borderColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                  }}
                />
              </View>

              {/* Text Info */}
              <Text style={{ fontSize: 22, fontWeight: "800", color: TEXT, letterSpacing: -0.4 }}>
                {profile.displayName}
              </Text>
              
              <Text style={{ fontSize: 14, color: MUTED, marginTop: 2, fontWeight: "400" }}>
                {displayHandle}
              </Text>



              {/* Biography */}
              <Text
                style={{
                  fontSize: 14,
                  color: TEXT_SECONDARY,
                  lineHeight: 20,
                  marginTop: 12,
                  letterSpacing: 0.1,
                }}
              >
                {profile.bio || "No bio description yet."}
              </Text>

              {/* Social Metrics */}
              <View style={{ flexDirection: "row", gap: 16, marginTop: 14 }}>
                <Text style={{ fontSize: 13, color: MUTED }}>
                  <Text style={{ fontWeight: "700", color: TEXT }}>482</Text> following
                </Text>
                <Text style={{ fontSize: 13, color: MUTED }}>
                  <Text style={{ fontWeight: "700", color: TEXT }}>1.2k</Text> followers
                </Text>
              </View>
            </View>

            {/* Section Divider & Header for Posts Feed */}
            <View
              style={{
                height: 1,
                backgroundColor: HAIRLINE,
              }}
            />
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE_HOVER }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Recent activity
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: HAIRLINE,
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={{ padding: 48, alignItems: "center" }}>
            <><Ionicons name="chatbubbles-outline" size={32} color={MUTED} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 13, color: MUTED, textAlign: "center" }}>
                  No posts yet. Start conversation in your constituency.
                </Text>
              </>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: HAIRLINE,
            }}
          >
            {/* Post Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar name={profile.displayName} size={28} seed={profile.id} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT }}>
                    {profile.displayName}
                  </Text>
                  <Text style={{ fontSize: 11, color: MUTED }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Constituency Tag */}
              {item.constituency ? (
                <Pressable
                  onPress={() => router.push(`/spaces/${item.constituency!.code}`)}
                  style={{
                    backgroundColor: SURFACE_ALT,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 10, color: MUTED, fontWeight: "500" }}>
                    #{item.constituency?.nameEn ?? ""}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Post Body */}
            <Text style={{ fontSize: 14, color: TEXT, lineHeight: 20, marginTop: 10 }}>
              {item.body}
            </Text>
          </View>
        )}
      />

      {/* Bottom Drawer Sheet */}
      <Modal
        visible={showDrawer}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDrawer(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Transparent Backdrop */}
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

          {/* Drawer Content */}
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
            {/* Drag Handle Indicator */}
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

            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT, marginBottom: 16 }}>
              Settings & Account
            </Text>

            {/* Action List */}
            <View style={{ gap: 4, marginBottom: 24 }}>
              {/* Edit Profile Row */}
              <Pressable
                onPress={handleEditPress}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: pressed ? SURFACE_HOVER : "transparent",
                })}
              >
                <Ionicons name="pencil-outline" size={18} color={TEXT} style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: TEXT }}>
                  Edit Profile
                </Text>
              </Pressable>

              {/* Go Back / Return Row */}
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
                <Ionicons name="arrow-back-outline" size={18} color={TEXT} style={{ marginRight: 12 }} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: TEXT }}>
                  Go Back
                </Text>
              </Pressable>


            </View>

            {/* Metadata / Info Section */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: HAIRLINE,
                paddingTop: 16,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Account Information
              </Text>

              {/* Account ID Row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 11, color: MUTED }}>Account ID</Text>
                  <Text style={{ fontSize: 12, color: TEXT, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", marginTop: 2 }}>
                    {profile.id.slice(0, 16)}...
                  </Text>
                </View>
                <Pressable
                  onPress={copyAccountId}
                  style={({ pressed }) => ({
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    backgroundColor: pressed ? SURFACE_HOVER : SURFACE_ALT,
                  })}
                >
                  <Text style={{ fontSize: 10, color: TEXT, fontWeight: "600" }}>
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </Pressable>
              </View>

              {/* Member Since Row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: MUTED }}>Member Since</Text>
                <Text style={{ fontSize: 12, color: TEXT, fontWeight: "500" }}>
                  {new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>


            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}>
          {/* Header */}
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setIsEditing(false);
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: MUTED }}>Cancel</Text>
            </Pressable>

            <Text style={{ fontSize: 16, fontWeight: "700", color: TEXT }}>
              Edit Profile
            </Text>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => ({
                opacity: pressed || saving ? 0.6 : 1,
              })}
            >
              {saving ? (
                <ActivityIndicator size="small" color={ACCENT} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: "700", color: ACCENT }}>Done</Text>
              )}
            </Pressable>
          </View>

          {/* Form */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, padding: 16 }}
          >
            {errorMsg ? (
              <View style={{ padding: 12, backgroundColor: "#FDEDEC", borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: DANGER, fontSize: 13 }}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Edit Display Name */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>
                Display Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Name"
                placeholderTextColor={MUTED}
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

            {/* Edit Handle */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>
                Handle Name
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: BORDER_IDLE,
                  borderRadius: 8,
                  backgroundColor: "white",
                  paddingHorizontal: 12,
                  height: 44,
                }}
              >
                <Text style={{ fontSize: 15, color: MUTED, marginRight: 2 }}>@</Text>
                <TextInput
                  value={editHandle}
                  onChangeText={(val) => setEditHandle(val.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="handle"
                  placeholderTextColor={MUTED}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    height: 44,
                    fontSize: 15,
                    color: TEXT,
                  }}
                />
                <Text style={{ fontSize: 13, color: MUTED }}>.tamilatchi.org</Text>
              </View>
            </View>

            {/* Edit Bio */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>
                Bio
              </Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Introduce yourself to the assembly..."
                placeholderTextColor={MUTED}
                multiline
                numberOfLines={3}
                style={{
                  minHeight: 88,
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
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
