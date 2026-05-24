import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Women's Collective", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Women's Collective"
        titleTa="பெண்கள் சங்கம்"
        blurb="Self-help groups, legal aid against domestic violence, maternal health support, and women-led microenterprise circles."
        icon="female-outline"
      />
    </>
  );
}
