import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Makkal Mandram", headerBackVisible: false }} />
      <ModuleStub
        titleEn="People's Assembly"
        titleTa="மக்கள் மன்றம்"
        blurb="Digital village/ward meetings. Participate in discussions, debate proposals, vote on local priorities, review representatives, and join specialized assemblies (women's, farmers', workers', diaspora)."
        icon="people-circle-outline"
      />
    </>
  );
}
