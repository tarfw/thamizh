import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Anti-Caste Justice", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Anti-Caste Justice"
        titleTa="சாதி ஒழிப்பு"
        blurb="Secure atrocity reporting, encrypted evidence vault, survivor consent controls, and legal-aid routing. Anonymous mode by default; no public exposure without explicit consent."
      />
    </>
  );
}
