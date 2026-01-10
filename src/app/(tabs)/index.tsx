// src/app/(tabs)/index.tsx

import { ContinueReadingCard, SearchHero } from "@/components/home";
import { JuzListScreen, SurahListScreen } from "@/components/quran";
import React, { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { NavigationSegments } from "../../components/ui";

const BROWSE_MODES = [
  { id: "surah", label: "Surah", labelAr: "سورة" },
  { id: "juz", label: "Juz", labelAr: "جزء" },
] as const;

type Mode = "surah" | "juz";

export default function HomeScreen() {
  const [activeMode, setActiveMode] = useState<Mode>("surah");

  const onSelectMode = (id: string) => {
    const next = id as Mode;

    setActiveMode(next);
  };
  const content = (
    <>
      {/* Hero Section - Prominent title and search */}
      <View className="bg-surface-elevated px-4 sm:px-8 pt-8 pb-6 z-10">
        <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
          <Text
            className="font-ui-ar text-5xl font-bold text-text-primary text-center mb-6"
            accessible
            accessibilityRole="header"
            accessibilityLabel="Al Quran Al Kareem"
          >
            القرآن الكريم
          </Text>
          <SearchHero />
        </View>
      </View>

      {/* Continue Reading + Bookmarks Section */}
      <View className="px-4 sm:px-8 py-6">
        <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
          <View className="flex-row gap-6">
            {/* Continue Reading - Left Column */}
            <View className="flex-1">
              <Text className="font-ui-en text-xl font-semibold text-text-primary mb-4">
                Continue Reading
              </Text>
              <ContinueReadingCard />
            </View>

            {/* Latest Bookmarks - Right Column (hidden on mobile) */}
            <View className="hidden md:flex flex-1">
              <Text className="font-ui-en text-xl font-semibold text-text-primary mb-4">
                Latest Bookmarks
              </Text>
              <View className="bg-surface border border-border rounded-xl p-6">
                <Text className="font-ui-en text-sm text-text-secondary text-center">
                  Your bookmarked verses will appear here
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Browse Section */}
      <View className="px-3 sm:px-6 md:px-8 pt-2 pb-4">
        <View className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          <NavigationSegments
            segments={BROWSE_MODES}
            activeSegment={activeMode}
            onSelect={onSelectMode}
          />
        </View>
      </View>

      <View>
        <View
          style={{ display: activeMode === "surah" ? "flex" : "none" }}
          pointerEvents={activeMode === "surah" ? "auto" : "none"}
        >
          <SurahListScreen />
        </View>

        <View
          style={{ display: activeMode === "juz" ? "flex" : "none" }}
          pointerEvents={activeMode === "juz" ? "auto" : "none"}
        >
          <JuzListScreen />
        </View>
      </View>
    </>
  );

  // On web, wrap in ScrollView for natural page scrolling
  if (Platform.OS === "web") {
    return <ScrollView className="flex-1 bg-background">{content}</ScrollView>;
  }

  return <View className="flex-1 bg-background">{content}</View>;
}
