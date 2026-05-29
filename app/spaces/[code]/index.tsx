import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSpacetimeDB } from "@/lib/SpacetimeDBProvider";
import { callReducer, ts } from "@/lib/db";
import { useSession, constituencies } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import {
  ACCENT,
  ACCENT_DARK,
  BORDER_IDLE,
  HAIRLINE,
  MUTED,
  SURFACE_ALT,
  TEXT,
} from "@/lib/theme";

type Message = {
  id: string;
  body: string;
  createdAt: number;
  author?: { id: string; displayName: string };
};

export default function ConstituencyChat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isLoading: sessionLoading, user, profile } = useSession();
  const [focused, setFocused] = useState(false);
const { messages: allMessages } = useSpacetimeDB();
  const [draft, setDraft] = useState("");

  const constituency = constituencies.find((c) => c.code === code) || null;

  const messages = allMessages
    .filter((m) => m.roomType === "constituency" && m.roomId === code)
    .sort((a, b) => ts(b.sent) - ts(a.sent))
    .slice(0, 200)
    .map((m, idx) => ({
      id: `${m.sender.toHexString()}_${ts(m.sent)}_${idx}`,
      body: m.body,
      createdAt: ts(m.sent),
      author: { id: m.sender.toHexString(), displayName: m.sender.toHexString().slice(0, 8) },
    })) as Message[];

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
  if (!profile) return null;

  const send = async () => {
    const body = draft.trim();
    if (!body || !constituency) return;
    setDraft("");
    try {
      await callReducer("send_message", { roomType: "constituency", roomId: code, body, parentId: undefined });
    } catch (e) {
      console.error("[chat] send_message failed:", e);
      setDraft(body);
    }
  };

  const canSend = !!draft.trim();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: HAIRLINE,
        }}
      >
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/spaces/${code}/hub`)}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 4,
              paddingHorizontal: 4,
              borderRadius: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {constituency ? (
              <Avatar
                name={constituency.nameEn}
                size={36}
                seed={constituency.id}
              />
            ) : (
              <View style={{ width: 36, height: 36 }} />
            )}
            <View style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  color: TEXT,
                  fontWeight: "500",
                  letterSpacing: 0.1,
                }}
              >
                {constituency?.nameEn ?? ""}
              </Text>
              {constituency ? (
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 12, color: MUTED, marginTop: 1 }}
                >
                  #{constituency.number} · {constituency.district}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/spaces/${code}/hub`)}
            hitSlop={6}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="apps-outline" size={22} color={TEXT} />
          </Pressable>
          <Pressable
            hitSlop={6}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={TEXT} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          style={{ flex: 1 }}
          data={messages}
          inverted
          keyExtractor={(m) => m.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingVertical: 12,
            paddingHorizontal: 8,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-start",
          }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 32,
                paddingVertical: 32,
                transform: [{ scaleY: -1 }, { scaleX: -1 }],
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: SURFACE_ALT,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="chatbox-outline" size={32} color={MUTED} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: TEXT,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                Start the conversation
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
                {"Be the first to send a message in this space."}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const mine = item.author?.id === profile.id;
            const prev = messages[index + 1];
            const next = messages[index - 1];
            const sameAuthorAsPrev = prev?.author?.id === item.author?.id;
            const sameAuthorAsNext = next?.author?.id === item.author?.id;
            const gapPrev =
              !!prev && item.createdAt - prev.createdAt > 5 * 60 * 1000;
            const showHeader = !sameAuthorAsPrev || gapPrev;
            const showTail = !sameAuthorAsNext;
            return (
              <Bubble
                message={item}
                mine={mine}
                showHeader={showHeader}
                showTail={showTail}
              />
            );
          }}
        />

        {/* Composer */}
        <View
          style={{
            backgroundColor: "white",
            paddingBottom: (insets.bottom || 8),
            paddingTop: 8,
            paddingHorizontal: 12,
            borderTopWidth: 1,
            borderTopColor: HAIRLINE,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              borderWidth: 1,
              borderColor: focused ? ACCENT : BORDER_IDLE,
              borderRadius: 24,
              paddingHorizontal: 4,
              paddingVertical: 4,
              backgroundColor: "white",
              minHeight: 48,
            }}
          >
            <Pressable
              hitSlop={6}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="add" size={22} color={MUTED} />
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Message"
              placeholderTextColor={MUTED}
              multiline
              style={{
                flex: 1,
                maxHeight: 120,
                minHeight: 38,
                paddingHorizontal: 4,
                paddingTop: Platform.OS === "ios" ? 10 : 8,
                paddingBottom: Platform.OS === "ios" ? 10 : 8,
                color: TEXT,
                fontSize: 15,
                lineHeight: 20,
                textAlignVertical: "center",
              }}
            />
            <Pressable
              hitSlop={6}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="happy-outline" size={20} color={MUTED} />
            </Pressable>
            <Pressable
              onPress={send}
              disabled={!canSend}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: !canSend
                  ? "transparent"
                  : pressed
                    ? ACCENT_DARK
                    : ACCENT,
              })}
            >
              <Ionicons
                name="send"
                size={18}
                color={!canSend ? MUTED : "white"}
                style={{ marginLeft: -1 }}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({
  message,
  mine,
  showHeader,
  showTail,
}: {
  message: Message;
  mine: boolean;
  showHeader: boolean;
  showTail: boolean;
}) {
  const authorName = message.author?.displayName ?? "Member";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: showHeader ? 12 : 2,
        paddingHorizontal: 4,
        justifyContent: mine ? "flex-end" : "flex-start",
      }}
    >
      {!mine && (
        <View style={{ width: 32, marginRight: 8 }}>
          {showTail ? (
            <Avatar
              name={authorName}
              size={32}
              seed={message.author?.id ?? authorName}
            />
          ) : null}
        </View>
      )}
      <View style={{ maxWidth: "76%" }}>
        {showHeader && !mine ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginLeft: 12,
              marginBottom: 3,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                color: TEXT,
                fontWeight: "500",
                maxWidth: 160,
              }}
            >
              {authorName}
            </Text>
            <Text style={{ fontSize: 11, color: MUTED, marginLeft: 6 }}>
              {formatTime(message.createdAt)}
            </Text>
          </View>
        ) : null}
        <View
          style={{
            paddingHorizontal: 14,
            paddingVertical: 9,
            backgroundColor: mine ? ACCENT : SURFACE_ALT,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderBottomLeftRadius: !mine && !showTail ? 6 : 18,
            borderBottomRightRadius: mine && !showTail ? 6 : 18,
            alignSelf: mine ? "flex-end" : "flex-start",
          }}
        >
          <Text
            style={{
              color: mine ? "white" : TEXT,
              fontSize: 15,
              lineHeight: 20,
            }}
          >
            {message.body}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatTime(t: number) {
  return new Date(t).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
