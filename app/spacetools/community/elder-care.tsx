import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Elder & Disability Care", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Elder & Disability Care"
        titleTa="மூத்தோர் பராமரிப்பு"
        blurb="Home visits, medicine delivery, pension paperwork help, and companionship for elders and persons with disabilities living alone."
        icon="accessibility-outline"
      />
    </>
  );
}
