import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Education Support & Tuition", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Education Support & Tuition"
        titleTa="கல்வி உதவி"
        blurb="Free tuition circles, scholarship aid, book and uniform donation. Pair retired teachers and college students with first-generation learners."
        icon="school-outline"
      />
    </>
  );
}
