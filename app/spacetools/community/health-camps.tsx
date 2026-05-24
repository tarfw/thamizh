import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Health Camps & Clinics", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Health Camps & Clinics"
        titleTa="மருத்துவ முகாம்"
        blurb="Free check-up camps, eye and dental clinics, women's health screenings, and chronic disease tracking with local PHCs."
        icon="medkit-outline"
      />
    </>
  );
}
