import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Food Donation & Annadanam", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Food Donation & Annadanam"
        titleTa="அன்னதானம்"
        blurb="Connect surplus food from kitchens, weddings, and shops to community kitchens, orphanages, and the homeless. Schedule annadanam events."
        icon="restaurant-outline"
      />
    </>
  );
}
