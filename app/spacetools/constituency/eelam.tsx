import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Tamil Eelam Rights", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Tamil Eelam Rights"
        titleTa="தமிழீழ உரிமை"
        blurb="Human-rights documentation, missing-persons archive, language-rights tracker, memorial archive, and diaspora legal advocacy. Sensitive identities are hidden by default; release requires consent and legal review."
      />
    </>
  );
}
