import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Makkal Kural", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Public Voice (Makkal Kural)"
        titleTa="மக்கள் குரல்"
        blurb="Report and track community issues (water, roads, schools, hospitals, caste discrimination, land grabbing, corruption) with photo/video uploads and automated AI routing to responsible departments."
        icon="megaphone-outline"
      />
    </>
  );
}
