import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Public Ledger", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Public Audit Ledger"
        titleTa="பொது தணிக்கை கணக்கு"
        blurb="Inspect a transparent, tamper-resistant record ledger containing history of public votes, budget allocations, representative pledges, and contract completion audits."
        icon="cube-outline"
      />
    </>
  );
}
