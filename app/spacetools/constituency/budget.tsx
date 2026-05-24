import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Participatory Budget", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Participatory Budget"
        titleTa="பட்ஜெட்"
        blurb="Village, ward, and constituency-level budgets made public. Rank projects, see contractor payments, and track whether money is reaching oppressed communities."
      />
    </>
  );
}
