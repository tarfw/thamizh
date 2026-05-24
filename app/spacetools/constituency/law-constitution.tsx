import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Law & Constitution", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Law & Constitution Layer"
        titleTa="சட்டமும் அரசியலமைப்பும்"
        blurb="Understand legal framework drafts, public comment options, and analyze social justice, environmental, minority, and caste-protection impacts of laws and constitutional reviews in clear Tamil."
        icon="journal-outline"
      />
    </>
  );
}
