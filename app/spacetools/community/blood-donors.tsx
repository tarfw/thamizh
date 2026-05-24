import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ACCENT,
  ACCENT_SOFT,
  BORDER_IDLE,
  DANGER,
  HAIRLINE,
  MUTED,
  SUCCESS,
  SURFACE_ALT,
  SURFACE_HOVER,
  TEXT,
  TEXT_SECONDARY,
} from "@/lib/theme";

const BLOOD_RED = "#D93025";
const BLOOD_RED_SOFT = "#FCE8E6";

type TabKey = "home" | "requests" | "profile" | "ai" | "camps";

type Urgency = "Critical" | "Urgent" | "Routine";

type Request = {
  id: string;
  group: string;
  units: number;
  hospital: string;
  city: string;
  km: number;
  postedMin: number;
  urgency: Urgency;
  match: number;
  patient: string;
};

type Camp = {
  id: string;
  name: string;
  org: string;
  date: string;
  time: string;
  city: string;
  km: number;
  slots: number;
};

type Donation = {
  id: string;
  date: string;
  place: string;
  units: number;
};

type ChatMsg = { id: string; from: "ai" | "me"; text: string };

const MOCK_REQUESTS: Request[] = [
  {
    id: "r1",
    group: "O-",
    units: 2,
    hospital: "Apollo Speciality",
    city: "Madurai",
    km: 2.3,
    postedMin: 4,
    urgency: "Critical",
    match: 96,
    patient: "Trauma case · ICU",
  },
  {
    id: "r2",
    group: "A+",
    units: 1,
    hospital: "GRH Hospital",
    city: "Madurai",
    km: 5.8,
    postedMin: 22,
    urgency: "Urgent",
    match: 78,
    patient: "Surgery scheduled 6pm",
  },
  {
    id: "r3",
    group: "B+",
    units: 3,
    hospital: "Meenakshi Mission",
    city: "Madurai",
    km: 8.1,
    postedMin: 47,
    urgency: "Urgent",
    match: 64,
    patient: "Thalassemia · pediatric",
  },
  {
    id: "r4",
    group: "AB+",
    units: 1,
    hospital: "Vadamalayan Hospital",
    city: "Madurai",
    km: 11.4,
    postedMin: 110,
    urgency: "Routine",
    match: 41,
    patient: "Elective procedure",
  },
];

const MOCK_CAMPS: Camp[] = [
  {
    id: "c1",
    name: "Pongal Drive 2026",
    org: "Rotary · Madurai South",
    date: "Jun 02",
    time: "8:00 – 1:00",
    city: "Anna Nagar",
    km: 1.4,
    slots: 38,
  },
  {
    id: "c2",
    name: "Thalassemia Awareness Camp",
    org: "GRH Hospital",
    date: "Jun 09",
    time: "9:00 – 3:00",
    city: "Goripalayam",
    km: 3.2,
    slots: 12,
  },
  {
    id: "c3",
    name: "World Donor Day",
    org: "Lions Club",
    date: "Jun 14",
    time: "7:00 – 5:00",
    city: "K.K. Nagar",
    km: 4.6,
    slots: 60,
  },
];

const MOCK_DONATIONS: Donation[] = [
  { id: "d1", date: "Feb 11, 2026", place: "Apollo Madurai", units: 1 },
  { id: "d2", date: "Oct 02, 2025", place: "Lions Club Camp", units: 1 },
  { id: "d3", date: "Jun 14, 2025", place: "World Donor Day", units: 1 },
  { id: "d4", date: "Jan 22, 2025", place: "GRH Hospital", units: 1 },
];

const AI_SUGGESTIONS = [
  "Am I eligible today?",
  "Find nearest camp",
  "Predict shortage this week",
  "Iron-rich diet tips",
];

export default function Screen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>("home");
  const [available, setAvailable] = useState(true);
  const [respondTo, setRespondTo] = useState<Request | null>(null);
  const [responded, setResponded] = useState<Record<string, boolean>>({});
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const onTab = (t: TabKey) => {
    Haptics.selectionAsync().catch(() => {});
    setTab(t);
  };

  const onRespond = (r: Request) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRespondTo(r);
  };

  const confirmRespond = () => {
    if (!respondTo) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setResponded((p) => ({ ...p, [respondTo.id]: true }));
    setRespondTo(null);
  };

  const toggleRsvp = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRsvped((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ headerTitle: "Blood Donor Registry", headerBackVisible: true }} />

      <View style={{ paddingTop: insets.top, borderBottomWidth: 1, borderBottomColor: HAIRLINE, backgroundColor: "white" }}>
        <View style={{ height: 56, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: BLOOD_RED_SOFT, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
            <Ionicons name="water" size={16} color={BLOOD_RED} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, color: TEXT, fontWeight: "500", letterSpacing: 0.1 }} numberOfLines={1}>
              Blood Donor Registry
            </Text>
            <Text style={{ fontSize: 11, color: MUTED, marginTop: 1 }} numberOfLines={1}>
              இரத்த தான பதிவு
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: available ? "#E6F4EA" : SURFACE_ALT }}>
            <Animated.View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: available ? SUCCESS : MUTED,
                marginRight: 6,
                opacity: available ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) : 1,
              }}
            />
            <Text style={{ fontSize: 11, color: available ? SUCCESS : MUTED, fontWeight: "600" }}>
              {available ? "Available" : "Paused"}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10, gap: 6 }}
        >
          {(
            [
              { k: "home", l: "Home", i: "home-outline" as const },
              { k: "requests", l: "Requests", i: "flash-outline" as const },
              { k: "profile", l: "My Card", i: "person-circle-outline" as const },
              { k: "ai", l: "AI Assist", i: "sparkles-outline" as const },
              { k: "camps", l: "Camps", i: "calendar-outline" as const },
            ] as { k: TabKey; l: string; i: keyof typeof Ionicons.glyphMap }[]
          ).map((t) => {
            const on = tab === t.k;
            return (
              <Pressable
                key={t.k}
                onPress={() => onTab(t.k)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: on ? TEXT : SURFACE_ALT,
                }}
              >
                <Ionicons name={t.i} size={14} color={on ? "white" : TEXT_SECONDARY} />
                <Text style={{ marginLeft: 6, fontSize: 12.5, fontWeight: "600", color: on ? "white" : TEXT_SECONDARY }}>
                  {t.l}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {tab === "home" && (
          <HomeTab pulse={pulse} requests={MOCK_REQUESTS} onJump={onTab} />
        )}
        {tab === "requests" && (
          <RequestsTab
            requests={MOCK_REQUESTS}
            pulse={pulse}
            responded={responded}
            onRespond={onRespond}
          />
        )}
        {tab === "profile" && (
          <ProfileTab
            available={available}
            onToggleAvailable={() => {
              Haptics.selectionAsync().catch(() => {});
              setAvailable((v) => !v);
            }}
          />
        )}
        {tab === "ai" && <AITab />}
        {tab === "camps" && (
          <CampsTab
            camps={MOCK_CAMPS}
            donations={MOCK_DONATIONS}
            rsvped={rsvped}
            onRsvp={toggleRsvp}
          />
        )}
      </ScrollView>

      <RespondSheet
        request={respondTo}
        onClose={() => setRespondTo(null)}
        onConfirm={confirmRespond}
      />
    </View>
  );
}

function Section({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ flex: 1, fontSize: 13, fontWeight: "600", color: MUTED, letterSpacing: 0.6, textTransform: "uppercase" }}>
          {title}
        </Text>
        {action ? (
          <Text style={{ fontSize: 12, color: ACCENT, fontWeight: "600" }}>{action}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function HomeTab({ pulse, requests, onJump }: { pulse: Animated.Value; requests: Request[]; onJump: (t: TabKey) => void }) {
  const critical = requests.filter((r) => r.urgency === "Critical").length;
  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <View
          style={{
            borderRadius: 16,
            backgroundColor: BLOOD_RED,
            padding: 18,
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="water" size={20} color="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", letterSpacing: 0.6 }}>
                LIVE · MADURAI NETWORK
              </Text>
              <Text style={{ color: "white", fontSize: 19, fontWeight: "600", marginTop: 2 }}>
                {critical} critical request{critical === 1 ? "" : "s"} nearby
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 18 }}>
            <Stat label="Active donors" value="2,847" />
            <Stat label="Units this month" value="412" />
            <Stat label="Lives saved" value="1.2K" />
          </View>
        </View>
      </View>

      <Section title="AI Insight">
        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: HAIRLINE,
            padding: 14,
            backgroundColor: "white",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENT_SOFT, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles" size={13} color={ACCENT} />
            </View>
            <Text style={{ marginLeft: 8, fontSize: 12, color: ACCENT, fontWeight: "600" }}>Predictive match</Text>
          </View>
          <Text style={{ fontSize: 14, color: TEXT, lineHeight: 20 }}>
            Demand for <Text style={{ fontWeight: "600", color: BLOOD_RED }}>O−</Text> is up 38% this week in Madurai South. You're a likely match for{" "}
            <Text style={{ fontWeight: "600" }}>3 nearby requests</Text>.
          </Text>
          <Pressable
            onPress={() => onJump("requests")}
            style={{ marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 12, height: 32, borderRadius: 16, backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "white", fontSize: 12.5, fontWeight: "600" }}>View matches</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="Quick actions">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <QuickAction icon="water-outline" label="Donate" sub="Schedule" onPress={() => onJump("camps")} />
          <QuickAction icon="medkit-outline" label="Request" sub="For patient" onPress={() => onJump("requests")} tint={BLOOD_RED} tintSoft={BLOOD_RED_SOFT} />
          <QuickAction icon="search-outline" label="Find" sub="By group" onPress={() => onJump("requests")} />
        </View>
      </Section>

      <Section title="Top requests" action="See all">
        {requests.slice(0, 2).map((r) => (
          <CompactRequestCard key={r.id} request={r} pulse={pulse} onPress={() => onJump("requests")} />
        ))}
      </Section>

      <Section title="Your impact">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ImpactCard value="4" label="Donations" />
          <ImpactCard value="12" label="Lives touched" />
          <ImpactCard value="A+" label="Your group" tint={BLOOD_RED} />
        </View>
      </Section>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.78)", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  sub,
  onPress,
  tint = ACCENT,
  tintSoft = ACCENT_SOFT,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  onPress: () => void;
  tint?: string;
  tintSoft?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: HAIRLINE,
        padding: 12,
        backgroundColor: "white",
      }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tintSoft, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={{ marginTop: 10, fontSize: 13.5, fontWeight: "600", color: TEXT }}>{label}</Text>
      <Text style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{sub}</Text>
    </Pressable>
  );
}

function ImpactCard({ value, label, tint = ACCENT }: { value: string; label: string; tint?: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 12, backgroundColor: SURFACE_ALT, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", color: tint }}>{value}</Text>
      <Text style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function urgencyColor(u: Urgency) {
  if (u === "Critical") return BLOOD_RED;
  if (u === "Urgent") return "#E8710A";
  return MUTED;
}
function urgencySoft(u: Urgency) {
  if (u === "Critical") return BLOOD_RED_SOFT;
  if (u === "Urgent") return "#FEEFE3";
  return SURFACE_ALT;
}

function CompactRequestCard({ request, pulse, onPress }: { request: Request; pulse: Animated.Value; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: HAIRLINE,
        padding: 14,
        marginBottom: 10,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: BLOOD_RED_SOFT,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: BLOOD_RED, fontWeight: "700", fontSize: 14 }}>{request.group}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ flex: 1, fontSize: 14, color: TEXT, fontWeight: "600" }} numberOfLines={1}>
            {request.hospital}
          </Text>
          <View style={{ paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: urgencySoft(request.urgency), alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            {request.urgency === "Critical" ? (
              <Animated.View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  marginRight: 5,
                  backgroundColor: urgencyColor(request.urgency),
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
                }}
              />
            ) : null}
            <Text style={{ fontSize: 10.5, color: urgencyColor(request.urgency), fontWeight: "700" }}>
              {request.urgency.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: MUTED, marginTop: 3 }} numberOfLines={1}>
          {request.units} unit · {request.km} km · {request.postedMin}m ago
        </Text>
      </View>
    </Pressable>
  );
}

function RequestsTab({
  requests,
  pulse,
  responded,
  onRespond,
}: {
  requests: Request[];
  pulse: Animated.Value;
  responded: Record<string, boolean>;
  onRespond: (r: Request) => void;
}) {
  const [filter, setFilter] = useState<"All" | Urgency>("All");
  const filtered = useMemo(
    () => (filter === "All" ? requests : requests.filter((r) => r.urgency === filter)),
    [filter, requests]
  );

  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, flexDirection: "row", gap: 6 }}>
        {(["All", "Critical", "Urgent", "Routine"] as const).map((f) => {
          const on = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setFilter(f);
              }}
              style={{
                paddingHorizontal: 12,
                height: 30,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: on ? TEXT : BORDER_IDLE,
                backgroundColor: on ? TEXT : "white",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: on ? "white" : TEXT_SECONDARY, fontWeight: "600" }}>{f}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        {filtered.map((r) => (
          <RequestCard
            key={r.id}
            r={r}
            pulse={pulse}
            responded={!!responded[r.id]}
            onRespond={() => onRespond(r)}
          />
        ))}
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Ionicons name="checkmark-circle-outline" size={32} color={MUTED} />
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 8 }}>No {filter.toLowerCase()} requests right now.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RequestCard({ r, pulse, responded, onRespond }: { r: Request; pulse: Animated.Value; responded: boolean; onRespond: () => void }) {
  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: r.urgency === "Critical" ? BLOOD_RED_SOFT : HAIRLINE,
        backgroundColor: "white",
        padding: 14,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BLOOD_RED_SOFT,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: BLOOD_RED, fontWeight: "700", fontSize: 15 }}>{r.group}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, color: TEXT, fontWeight: "600" }} numberOfLines={1}>
            {r.hospital}
          </Text>
          <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }} numberOfLines={1}>
            {r.patient}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: urgencySoft(r.urgency), alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
          {r.urgency === "Critical" ? (
            <Animated.View
              style={{
                width: 5,
                height: 5,
                borderRadius: 2.5,
                marginRight: 5,
                backgroundColor: urgencyColor(r.urgency),
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
              }}
            />
          ) : null}
          <Text style={{ fontSize: 10.5, color: urgencyColor(r.urgency), fontWeight: "700" }}>{r.urgency.toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 14, gap: 10 }}>
        <Meta icon="cube-outline" label={`${r.units} unit${r.units > 1 ? "s" : ""}`} />
        <Meta icon="location-outline" label={`${r.km} km · ${r.city}`} />
        <Meta icon="time-outline" label={`${r.postedMin}m ago`} />
      </View>

      <View style={{ marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: ACCENT_SOFT, flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="sparkles" size={13} color={ACCENT} />
        <Text style={{ flex: 1, marginLeft: 8, fontSize: 12, color: ACCENT, fontWeight: "600" }}>
          AI match score
        </Text>
        <Text style={{ fontSize: 13, color: ACCENT, fontWeight: "700" }}>{r.match}%</Text>
      </View>

      <Pressable
        onPress={responded ? undefined : onRespond}
        style={{
          marginTop: 12,
          height: 40,
          borderRadius: 20,
          backgroundColor: responded ? SUCCESS : BLOOD_RED,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <Ionicons name={responded ? "checkmark" : "send"} size={14} color="white" />
        <Text style={{ color: "white", fontWeight: "600", fontSize: 13.5, marginLeft: 8 }}>
          {responded ? "Response sent" : "Respond"}
        </Text>
      </Pressable>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
      <Ionicons name={icon} size={13} color={MUTED} />
      <Text style={{ marginLeft: 5, fontSize: 11.5, color: TEXT_SECONDARY }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ProfileTab({ available, onToggleAvailable }: { available: boolean; onToggleAvailable: () => void }) {
  const lastDonationDays = 102;
  const eligible = lastDonationDays >= 90;
  const daysToEligible = Math.max(0, 90 - lastDonationDays);

  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <View
          style={{
            borderRadius: 18,
            backgroundColor: TEXT,
            padding: 18,
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", letterSpacing: 0.6 }}>
                DONOR CARD · MDU-2847
              </Text>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "600", marginTop: 4 }}>
                Karthik Rajan
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
                Madurai South · 124-Madurai Central
              </Text>
            </View>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: BLOOD_RED,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 18 }}>A+</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 18, marginBottom: 14 }} />

          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10.5, fontWeight: "600", letterSpacing: 0.4 }}>
                LAST DONATION
              </Text>
              <Text style={{ color: "white", fontSize: 13, fontWeight: "600", marginTop: 3 }}>
                {lastDonationDays} days ago
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10.5, fontWeight: "600", letterSpacing: 0.4 }}>
                ELIGIBLE
              </Text>
              <Text style={{ color: eligible ? "#81C995" : "#FCC934", fontSize: 13, fontWeight: "600", marginTop: 3 }}>
                {eligible ? "Yes · today" : `In ${daysToEligible}d`}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10.5, fontWeight: "600", letterSpacing: 0.4 }}>
                STREAK
              </Text>
              <Text style={{ color: "white", fontSize: 13, fontWeight: "600", marginTop: 3 }}>
                4 yrs · 4 units
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Section title="Availability">
        <Pressable
          onPress={onToggleAvailable}
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: HAIRLINE,
            padding: 14,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: available ? "#E6F4EA" : SURFACE_ALT, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={available ? "notifications" : "notifications-off-outline"} size={18} color={available ? SUCCESS : MUTED} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, color: TEXT, fontWeight: "600" }}>
              {available ? "Open to requests" : "Paused"}
            </Text>
            <Text style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
              {available ? "We'll notify you for matching emergencies." : "You won't receive emergency alerts."}
            </Text>
          </View>
          <View style={{ width: 40, height: 24, borderRadius: 12, backgroundColor: available ? SUCCESS : BORDER_IDLE, padding: 2, justifyContent: "center" }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: "white",
                alignSelf: available ? "flex-end" : "flex-start",
              }}
            />
          </View>
        </Pressable>
      </Section>

      <Section title="Health profile" action="Edit">
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: HAIRLINE, backgroundColor: "white" }}>
          <Row label="Weight" value="68 kg" />
          <Row label="Age" value="29" />
          <Row label="Recent illness" value="None reported" />
          <Row label="Last hemoglobin" value="14.2 g/dL" last />
        </View>
      </Section>

      <Section title="Badges">
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Badge icon="ribbon" label="Bronze" sub="3+ donations" tint={BLOOD_RED} />
          <Badge icon="flash" label="Rapid" sub="< 30m response" tint="#E8710A" />
          <Badge icon="shield-checkmark" label="Verified" sub="ID + Health" tint={SUCCESS} />
        </View>
      </Section>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: HAIRLINE }}>
      <Text style={{ flex: 1, fontSize: 13, color: MUTED }}>{label}</Text>
      <Text style={{ fontSize: 13, color: TEXT, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function Badge({ icon, label, sub, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; tint: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: HAIRLINE, padding: 12, alignItems: "center" }}>
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={{ marginTop: 6, fontSize: 12.5, color: TEXT, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>{sub}</Text>
    </View>
  );
}

function AITab() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: "m1",
      from: "ai",
      text: "Hi Karthik — I'm your donation assistant. Ask me about eligibility, nearby camps, or current demand.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    Haptics.selectionAsync().catch(() => {});
    setInput("");
    const mine: ChatMsg = { id: `m${Date.now()}`, from: "me", text: t };
    setMsgs((p) => [...p, mine]);
    setTimeout(() => {
      setMsgs((p) => [...p, { id: `m${Date.now()}-a`, from: "ai", text: aiReply(t) }]);
    }, 500);
  };

  return (
    <View>
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: HAIRLINE, padding: 14, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT_SOFT, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles" size={14} color={ACCENT} />
            </View>
            <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: "600", color: TEXT }}>Donation Assistant</Text>
          </View>

          {msgs.map((m) => (
            <View
              key={m.id}
              style={{
                alignSelf: m.from === "me" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                marginTop: 8,
                backgroundColor: m.from === "me" ? ACCENT : SURFACE_HOVER,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 9,
              }}
            >
              <Text style={{ fontSize: 13, lineHeight: 18, color: m.from === "me" ? "white" : TEXT }}>{m.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {AI_SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => send(s)}
            style={{ paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: ACCENT_SOFT, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 11.5, color: ACCENT, fontWeight: "600" }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 22, borderWidth: 1, borderColor: BORDER_IDLE, paddingHorizontal: 12, height: 44 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask the assistant…"
            placeholderTextColor={MUTED}
            style={{ flex: 1, fontSize: 13.5, color: TEXT }}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
          />
          <Pressable
            onPress={() => send(input)}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: input.trim() ? ACCENT : SURFACE_ALT, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="send" size={14} color={input.trim() ? "white" : MUTED} />
          </Pressable>
        </View>
      </View>

      <Section title="7-day demand forecast">
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: HAIRLINE, padding: 14, backgroundColor: "white" }}>
          <ForecastChart />
          <Text style={{ marginTop: 10, fontSize: 11.5, color: MUTED }}>
            Projected shortage windows by blood group · Madurai network
          </Text>
        </View>
      </Section>
    </View>
  );
}

function aiReply(q: string): string {
  const l = q.toLowerCase();
  if (l.includes("eligib")) return "Based on your last donation 102 days ago, weight 68 kg, and no recent illness — you're eligible to donate today. ✅";
  if (l.includes("camp")) return "Closest camp: Pongal Drive 2026, Anna Nagar — 1.4 km, Jun 02. 38 slots open. I can RSVP for you.";
  if (l.includes("shortage") || l.includes("predict")) return "Forecast: O− and B− will be tight Wed–Fri this week. A+ supply is healthy.";
  if (l.includes("diet") || l.includes("iron")) return "Pre-donation: leafy greens, dates, jaggery, citrus. Hydrate 24h before. Avoid heavy workouts day-of.";
  return "Got it — I'll surface that in your feed. Anything else?";
}

function ForecastChart() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const data = [
    { g: "O−", vals: [40, 55, 80, 90, 75, 50, 35], color: BLOOD_RED },
    { g: "A+", vals: [30, 35, 40, 38, 36, 32, 28], color: ACCENT },
    { g: "B+", vals: [50, 55, 60, 65, 55, 48, 40], color: "#E8710A" },
  ];
  const max = 100;
  const barW = 6;
  const gap = 3;
  const groupW = data.length * (barW + gap);
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 90 }}>
        {days.map((d, i) => (
          <View key={i} style={{ alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: 80, width: groupW, justifyContent: "center" }}>
              {data.map((row) => (
                <View
                  key={row.g}
                  style={{
                    width: barW,
                    marginRight: gap,
                    height: (row.vals[i] / max) * 80,
                    backgroundColor: row.color,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}
                />
              ))}
            </View>
            <Text style={{ marginTop: 6, fontSize: 10, color: MUTED }}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", marginTop: 10, gap: 12 }}>
        {data.map((row) => (
          <View key={row.g} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: row.color }} />
            <Text style={{ marginLeft: 5, fontSize: 11, color: TEXT_SECONDARY, fontWeight: "600" }}>{row.g}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CampsTab({
  camps,
  donations,
  rsvped,
  onRsvp,
}: {
  camps: Camp[];
  donations: Donation[];
  rsvped: Record<string, boolean>;
  onRsvp: (id: string) => void;
}) {
  return (
    <View>
      <Section title="Upcoming camps">
        {camps.map((c) => {
          const on = !!rsvped[c.id];
          return (
            <View
              key={c.id}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: HAIRLINE,
                padding: 14,
                marginBottom: 10,
                backgroundColor: "white",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  backgroundColor: SURFACE_ALT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 10, color: MUTED, fontWeight: "700", letterSpacing: 0.4 }}>{c.date.split(" ")[0].toUpperCase()}</Text>
                <Text style={{ fontSize: 16, color: TEXT, fontWeight: "700" }}>{c.date.split(" ")[1]}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, color: TEXT, fontWeight: "600" }} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }} numberOfLines={1}>
                  {c.org} · {c.time}
                </Text>
                <Text style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }} numberOfLines={1}>
                  {c.city} · {c.km} km · {c.slots} slots
                </Text>
              </View>
              <Pressable
                onPress={() => onRsvp(c.id)}
                style={{
                  paddingHorizontal: 12,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: on ? SUCCESS : ACCENT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                  {on ? "Going" : "RSVP"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </Section>

      <Section title="Donation history">
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: HAIRLINE, backgroundColor: "white" }}>
          {donations.map((d, i) => (
            <View
              key={d.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 13,
                borderBottomWidth: i === donations.length - 1 ? 0 : 1,
                borderBottomColor: HAIRLINE,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: BLOOD_RED_SOFT,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="water" size={14} color={BLOOD_RED} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 13.5, color: TEXT, fontWeight: "600" }}>{d.place}</Text>
                <Text style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{d.date}</Text>
              </View>
              <Text style={{ fontSize: 12, color: MUTED, fontWeight: "600" }}>{d.units}u</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Certificate">
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: HAIRLINE, padding: 16, backgroundColor: "white", alignItems: "center" }}>
          <Ionicons name="ribbon-outline" size={28} color={BLOOD_RED} />
          <Text style={{ marginTop: 8, fontSize: 14, color: TEXT, fontWeight: "600" }}>4 Donations · 12 Lives</Text>
          <Text style={{ marginTop: 4, fontSize: 11.5, color: MUTED, textAlign: "center" }}>
            Verified by Constituency Health Council · MDU-124
          </Text>
          <Pressable
            style={{ marginTop: 12, paddingHorizontal: 16, height: 32, borderRadius: 16, backgroundColor: SURFACE_ALT, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
          >
            <Ionicons name="download-outline" size={13} color={TEXT} />
            <Text style={{ marginLeft: 6, fontSize: 12, color: TEXT, fontWeight: "600" }}>Download PDF</Text>
          </Pressable>
        </View>
      </Section>
    </View>
  );
}

function RespondSheet({ request, onClose, onConfirm }: { request: Request | null; onClose: () => void; onConfirm: () => void }) {
  const [eta, setEta] = useState("30 min");
  return (
    <Modal visible={!!request} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}>
          <View style={{ alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: BORDER_IDLE, marginBottom: 12 }} />
          {request ? (
            <>
              <Text style={{ fontSize: 18, fontWeight: "600", color: TEXT }}>Respond to {request.hospital}</Text>
              <Text style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>
                {request.units} unit · {request.group} · {request.km} km away
              </Text>

              <View style={{ marginTop: 18, padding: 12, borderRadius: 10, backgroundColor: ACCENT_SOFT, flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="sparkles" size={14} color={ACCENT} />
                <Text style={{ flex: 1, marginLeft: 8, fontSize: 12, color: ACCENT, fontWeight: "600" }}>
                  AI verified eligible · {request.match}% match
                </Text>
              </View>

              <Text style={{ marginTop: 18, fontSize: 12, color: MUTED, fontWeight: "600", letterSpacing: 0.4 }}>
                YOUR ETA
              </Text>
              <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
                {["15 min", "30 min", "1 hour", "2 hours"].map((t) => {
                  const on = t === eta;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setEta(t);
                      }}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 19,
                        borderWidth: 1,
                        borderColor: on ? TEXT : BORDER_IDLE,
                        backgroundColor: on ? TEXT : "white",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 12, color: on ? "white" : TEXT_SECONDARY, fontWeight: "600" }}>{t}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={onConfirm}
                style={{ marginTop: 20, height: 46, borderRadius: 23, backgroundColor: BLOOD_RED, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
              >
                <Ionicons name="water" size={15} color="white" />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
                  Confirm — I'll be there in {eta}
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={{ marginTop: 8, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: MUTED, fontSize: 13 }}>Cancel</Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
