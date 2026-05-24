import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Moderator Console", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Admin & Moderator Console"
        titleTa="நிர்வாகி டேஷ்போர்டு"
        blurb="Moderation tools to enforce space guidelines, review flagged reports, manage user bans, resolve assembly disputes, and check AI-generated content audits."
        icon="shield-half-outline"
      />
    </>
  );
}
