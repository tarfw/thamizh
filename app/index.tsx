import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/lib/auth";
import { ACCENT, MUTED } from "@/lib/theme";

export default function Index() {
  const { isLoading, error, user } = useSession();
  const router = useRouter();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (isLoading || error) return;
    if (userId) {
      router.replace("/spaces");
    } else {
      router.replace("/sign-in");
    }
  }, [isLoading, error, userId]);

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
          {String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color={ACCENT} />
    </View>
  );
}
