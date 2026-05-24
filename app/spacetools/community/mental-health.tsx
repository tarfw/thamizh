import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Mental Health Support", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Mental Health Support"
        titleTa="மன நல உதவி"
        blurb="Peer support groups, suicide prevention helpline coordination, and stigma-free counselling referrals across the constituency."
        icon="happy-outline"
      />
    </>
  );
}
