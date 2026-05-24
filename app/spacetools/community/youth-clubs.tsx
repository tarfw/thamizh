import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Youth Clubs & Sports", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Youth Clubs & Sports"
        titleTa="இளைஞர் சங்கம்"
        blurb="Local sports leagues, youth clubs, mentorship, and anti-addiction programs. Use sport as a path out of caste and class silos."
        icon="football-outline"
      />
    </>
  );
}
