import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View } from "react-native";
import { Pressable } from "@/lib/Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, Stack, useRouter } from "expo-router";
import { useSession, constituencies, type ConstituencyRow } from "@/lib/auth";
import Avatar from "@/lib/Avatar";
import BrandLogo from "@/lib/BrandLogo";
import { ACCENT, ACCENT_SOFT, HAIRLINE, MUTED, SURFACE_ALT, SURFACE_HOVER, TEXT } from "@/lib/theme";

export default function PickConstituency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, user, profile } = useSession();
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return constituencies;
    return constituencies.filter(
      (r) =>
        r.nameEn.toLowerCase().includes(q) ||
        (r.nameTa ?? "").toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        String(r.number) === q ||
        r.code === q,
    );
  }, [query]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }
  if (!user) return <Redirect href="/sign-in" />;

  const pick = async (row: ConstituencyRow) => {
    setSaving(true);
    router.replace("/spaces");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 8, paddingBottom: 8, backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={({ pressed }) => ({ padding: 10, opacity: pressed ? 0.6 : 1 })}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </Pressable>
          <Text style={{ fontSize: 18, color: TEXT, fontWeight: "600", marginLeft: 4, letterSpacing: -0.1 }}>Choose constituency</Text>
        </View>
        <View style={{ marginRight: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT_SOFT, alignItems: "center", justifyContent: "center" }}>
          <BrandLogo size={16} color={ACCENT} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 10, backgroundColor: "white" }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: SURFACE_ALT, borderRadius: 24, paddingHorizontal: 14, height: 44 }}>
          <Ionicons name="search" size={18} color={MUTED} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search name, district, or number" placeholderTextColor={MUTED} autoCorrect={false} autoCapitalize="none" style={{ flex: 1, paddingHorizontal: 10, color: TEXT, fontSize: 15, height: 44 }} />
        </View>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={<View style={{ paddingTop: 80, alignItems: "center" }}><Text style={{ fontSize: 13, color: MUTED }}>No matches</Text></View>}
        renderItem={({ item }) => (
          <Pressable onPress={() => pick(item)} disabled={saving} android_ripple={{ color: SURFACE_HOVER }} style={({ pressed }) => ({ backgroundColor: pressed ? SURFACE_HOVER : "white", paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center" })}>
            <Avatar name={item.nameEn} size={40} seed={item.id} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text numberOfLines={1} style={{ fontSize: 15, color: TEXT, fontWeight: "500", flexShrink: 1, letterSpacing: 0.1 }}>{item.nameEn}</Text>
                {item.reservation && item.reservation !== "GEN" ? (
                  <View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 8, backgroundColor: SURFACE_ALT }}>
                    <Text style={{ fontSize: 10, color: MUTED, fontWeight: "600" }}>{item.reservation}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>#{item.number} · {item.district}{item.nameTa ? `  ·  ${item.nameTa}` : ""}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </Pressable>
        )}
      />
    </View>
  );
}
