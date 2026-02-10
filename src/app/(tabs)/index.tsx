// src/app/(tabs)/index.tsx

import { ContinueReadingCard, SearchHero } from "@/components/home";
import { JuzListScreen, SurahListScreen } from "@/components/quran";
import { NavigationSegments } from "@/components/ui";
import { SEOHead } from "@/shared/ui/SEOHead";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";

const BROWSE_MODES = [
  { id: "surah", label: msg`Surah` },
  { id: "juz", label: msg`Juz` },
] as const;

type Mode = "surah" | "juz";

export default function HomeScreen() {
  const { t, i18n } = useLingui();
  const [activeMode, setActiveMode] = useState<Mode>("surah");

  const onSelectMode = (id: string) => {
    setActiveMode(id as Mode);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <SEOHead
        title={t`Sakina Quran - Read the Holy Quran Online`}
        description={t`Read the Holy Quran Online. Browse by Surah or Juz with verse-by-verse navigation.`}
        type="website"
        keywords={t`Quran, Holy Quran, Islamic, Arabic, Surah, Juz, Ayah, Muslim, Islam, القرآن الكريم`}
      />

      {/* Hero Section */}
      <View className="bg-surface-elevated px-4 sm:px-8 pt-8 pb-6 z-10">
        <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
          <Text
            className={`text-5xl font-bold text-text-primary text-center mb-6`}
            accessible
            accessibilityRole="header"
            accessibilityLabel={t`The Noble Quran`}
          >
            <Trans>The Noble Quran</Trans>
          </Text>
          <SearchHero />
        </View>
      </View>

      {/* Continue Reading Section */}
      <View className="px-4 sm:px-8 py-6">
        <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
          <View className="flex-row gap-6">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-text-primary mb-4">
                <Trans>Continue Reading</Trans>
              </Text>
              <ContinueReadingCard />
            </View>
            <View className="hidden md:flex flex-1">
              <Text className="text-xl font-semibold text-text-primary mb-4">
                <Trans>Latest Bookmarks</Trans>
              </Text>
              <View className="bg-surface border border-border rounded-xl p-6">
                <Text className="text-sm text-text-secondary text-center">
                  <Trans>Your bookmarked verses will appear here</Trans>
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
            key={i18n.locale}
            segments={BROWSE_MODES}
            activeSegment={activeMode}
            onSelect={onSelectMode}
          />
        </View>
      </View>

      {/* Browse Lists - Keep both mounted, animate visibility */}
      <Animated.View
        style={{
          opacity: activeMode === "surah" ? 1 : 0,
          display: activeMode === "surah" ? "flex" : "none",
        }}
        pointerEvents={activeMode === "surah" ? "auto" : "none"}
      >
        <SurahListScreen />
      </Animated.View>

      <Animated.View
        style={{
          opacity: activeMode === "juz" ? 1 : 0,
          display: activeMode === "juz" ? "flex" : "none",
        }}
        pointerEvents={activeMode === "juz" ? "auto" : "none"}
      >
        <JuzListScreen />
      </Animated.View>
    </ScrollView>
  );
}
