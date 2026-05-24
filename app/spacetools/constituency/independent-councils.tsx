import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Councils", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Independent Councils"
        titleTa="சுயாதீன குழுக்கள்"
        blurb="Initialize, configure, and communicate with specialized local councils: Technical Council, Social Justice Council, Language Council, Legal Council, Public Audit Council, Data Privacy Council, and Oppressed Communities Council."
        icon="business-outline"
      />
    </>
  );
}
