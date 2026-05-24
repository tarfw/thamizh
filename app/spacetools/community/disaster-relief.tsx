import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Disaster Relief Volunteers", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Disaster Relief Volunteers"
        titleTa="இடர் நிவாரண தொண்டர்கள்"
        blurb="Mobilise volunteers during floods, cyclones, and emergencies. Coordinate supply chains, shelter, and rapid response teams."
        icon="umbrella-outline"
      />
    </>
  );
}
