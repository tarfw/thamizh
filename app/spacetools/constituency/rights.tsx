import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Rights", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Rights Dashboard"
        titleTa="உரிமை"
        blurb="See your education, land, labor, caste-protection, women's, refugee, welfare, police, and language rights in plain Tamil. Includes welfare eligibility and a rights assistant."
      />
    </>
  );
}
