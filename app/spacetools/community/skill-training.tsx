import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Skill Training & Livelihood", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Skill Training & Livelihood"
        titleTa="திறன் பயிற்சி"
        blurb="Tailoring, electrical, plumbing, digital, and trade skill workshops. Connect graduates to jobs and self-help cooperatives."
        icon="construct-outline"
      />
    </>
  );
}
