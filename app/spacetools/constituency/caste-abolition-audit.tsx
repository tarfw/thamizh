import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Social Justice Audit", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Social Justice Audit"
        titleTa="சமூக நீதி தணிக்கை"
        blurb="Tracks land ownership, temple entry access, manual scavenging violations, and local budget allocations to oppressed colonies. Features the social justice budget tracker and local Abolition Index score."
        icon="ribbon-outline"
      />
    </>
  );
}
