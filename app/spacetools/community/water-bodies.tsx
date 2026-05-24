import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Lake & Water Body Restoration", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Lake & Water Body Restoration"
        titleTa="ஏரி மீட்பு"
        blurb="Map and revive local eris, ponds, and wells. Track encroachment, organise desilting shrama-danam, and protect catchment areas."
        icon="water"
      />
    </>
  );
}
