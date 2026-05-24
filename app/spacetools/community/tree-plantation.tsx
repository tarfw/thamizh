import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Tree Plantation Drive", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Tree Plantation Drive"
        titleTa="மரம் நடுதல்"
        blurb="Organise tree plantation drives, track sapling survival rates, and assign caretakers ward-by-ward. Native species first."
        icon="leaf-outline"
      />
    </>
  );
}
