import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Organ Donation Pledge", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Organ Donation Pledge"
        titleTa="உறுப்பு தானம்"
        blurb="Pledge to donate organs and tissues. Link to state and national registries, and connect families with transplant counselling and legal guidance."
        icon="heart-outline"
      />
    </>
  );
}
