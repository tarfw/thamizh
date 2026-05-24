import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Representatives", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Representative Accountability"
        titleTa="பிரதிநிதிகள்"
        blurb="Promises, attendance, votes, funds received and spent, project completion, and social-justice record for every elected representative. Monthly AI-generated report card."
      />
    </>
  );
}
