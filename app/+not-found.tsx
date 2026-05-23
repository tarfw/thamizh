import { Link, Stack } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <SafeAreaView
        edges={["bottom"]}
        className="flex flex-1 items-center justify-center p-5"
      >
        <Text>This screen does not exist.</Text>
        <Link href="/" className="mt-[15px] py-[15px]">
          <Text>Go to home screen!</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}
