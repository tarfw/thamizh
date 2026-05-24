import { Stack } from "expo-router";
import ModuleStub from "@/lib/ModuleStub";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Tamil AI Assistant", headerBackVisible: false }} />
      <ModuleStub
        titleEn="Tamil AI Assistant"
        titleTa="தமிழ் AI உதவியாளர்"
        blurb="A Tamil-first AI that explains laws, budgets, and policies in plain Tamil. It can recommend, summarize, and translate — but never decide. Every output cites sources and can be appealed."
      />
    </>
  );
}
