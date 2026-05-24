import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Global Diaspora", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Global Tamil Diaspora Layer"
        titleTa="உலகளாவிய தமிழ் டயஸ்போரா"
        blurb="Connect global diaspora resources to local projects. Facilitate transparency-tracked funding, skill sharing (legal, technical, medical), disaster relief coordination, and cultural/historical archives."
        icon="globe-outline"
      />
    </>
  );
}
