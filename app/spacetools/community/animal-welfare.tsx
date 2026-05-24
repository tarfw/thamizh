import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Animal Welfare & Strays", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Animal Welfare & Strays"
        titleTa="விலங்கு நலன்"
        blurb="Stray dog and cattle care, sterilisation drives, rescue coordination, and feeders network. Partner with local vets."
        icon="paw-outline"
      />
    </>
  );
}
