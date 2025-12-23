// src/app/(tabs)/index.tsx

import { JuzListScreen, SurahListScreen } from "@/components/quran";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { NavigationSegments } from "../../components/ui";

const BROWSE_MODES = [
  { id: "surah", label: "Surah", labelAr: "سورة" },
  { id: "juz", label: "Juz", labelAr: "جزء" },
] as const;

export default function HomeScreen() {
  const [activeMode, setActiveMode] = useState<"surah" | "juz">("surah");

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text
          className="font-ui-ar text-3xl font-bold text-text-primary text-center mb-2"
          accessible
          accessibilityRole="header"
          accessibilityLabel="Al Quran Al Kareem"
        >
          القرآن الكريم
        </Text>
        <Text className="font-ui-en text-sm text-text-secondary text-center mb-4">
          The Holy Quran
        </Text>
      </View>
      <View className="px-4 pb-4">
        <NavigationSegments
          segments={BROWSE_MODES}
          activeSegment={activeMode}
          onSelect={(id) => setActiveMode(id as "surah" | "juz")}
        />
      </View>

      {activeMode === "surah" && <SurahListScreen />}
      {activeMode === "juz" && <JuzListScreen />}
    </View>
  );
}
