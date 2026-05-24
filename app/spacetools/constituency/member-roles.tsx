import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Member Roles", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Identity & Role Verification"
        titleTa="உறுப்பினர் பாத்திரங்கள்"
        blurb="Configure and audit role verifications for space participants: Resident Citizen, local Community Member, Diaspora Tamil, Expert Contributor, Public Official, and Elected Representative."
        icon="key-outline"
      />
    </>
  );
}
