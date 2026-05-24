import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Local Node", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Local Node Registry"
        titleTa="உள்ளூர் கிளை மேலாண்மை"
        blurb="Manage local records, verification workflows, local discussions, public village assembly meetings, and polling for this local node."
        icon="git-network-outline"
      />
    </>
  );
}
