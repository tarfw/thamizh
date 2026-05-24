import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Democratic Socialist Economy", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Democratic Socialist Economy"
        titleTa="ஜனநாயக சோசலிச பொருளாதாரம்"
        blurb="A socialist planning hub showing the public ownership dashboard, cooperative registry network (worker/farmer/fisher), labor rights monitor, land/housing justice trackers, and local food sovereignty planner."
        icon="briefcase-outline"
      />
    </>
  );
}
