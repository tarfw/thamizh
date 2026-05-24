import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { useSession } from "@/lib/auth";
import { ACCENT, MUTED } from "@/lib/theme";

export default function Index() {
  const { isLoading, error, user, profile } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={ACCENT} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-[14px]" style={{ color: "#c0392b" }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/sign-in" />;
  if (!profile?.constituency) return <Redirect href="/pick-constituency" />;
  return <Redirect href="/spaces" />;
}
