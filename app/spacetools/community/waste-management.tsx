import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Waste Management & Cleanup", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Waste Management & Cleanup"
        titleTa="கழிவு மேலாண்மை"
        blurb="Ward-level cleanup drives, segregation training, composting cooperatives, and pressure on the panchayat for regular collection."
        icon="trash-outline"
      />
    </>
  );
}
