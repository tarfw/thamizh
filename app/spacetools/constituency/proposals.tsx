import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Proposals", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Proposals & Policy"
        titleTa="திட்டங்கள்"
        blurb="Submit a problem with evidence, discuss it, check rights impact, estimate budget, and put it to a verified vote. Implementation is tracked and audited end-to-end."
      />
    </>
  );
}
