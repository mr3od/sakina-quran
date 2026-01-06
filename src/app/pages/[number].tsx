/**
 * Page Route - /pages/[number]
 * Main route for page-by-page Quran reading
 */

import { PageReaderScreen } from "@/features/quran-reader/ui";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function PageRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: Platform.OS === "web",
          title: "Quran",
          headerBackTitle: "Home",
        }}
      />
      <PageReaderScreen />
    </>
  );
}

export async function generateStaticParams(): Promise<{ number: string }[]> {
  return Array.from({ length: 604 }, (_, i) => ({
    number: (i + 1).toString(),
  }));
}
