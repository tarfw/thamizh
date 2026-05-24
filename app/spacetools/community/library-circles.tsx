import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Reading Circles & Libraries", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Reading Circles & Libraries"
        titleTa="நூலக வட்டம்"
        blurb="Free neighbourhood libraries, Tamil reading circles, and traveling book carts. Periyar, Ambedkar, and Bharati within walking distance."
        icon="library-outline"
      />
    </>
  );
}
