import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Trans, useLingui } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Platform, Text, View } from "react-native";
import { useJuzList } from "../../hooks/useJuzList";
import type { Surah } from "../../types/quran.types";
import { JuzListItem } from "./JuzListItem";
import { SurahListItem } from "./SurahListItem";

type JuzListItem =
  | { type: "header"; juzNumber: number }
  | { type: "surah"; surah: Surah };

export function JuzListScreen() {
  const { t } = useLingui();
  const { data: juzList, isLoading, isError, error } = useJuzList();

  // Transform data for section list
  const flatData = () => {
    if (!juzList) return [];

    const items: JuzListItem[] = [];
    juzList.forEach((juz) => {
      // Add header
      items.push({ type: "header", juzNumber: juz.juz_number });
      // Add surahs
      juz.surahs.forEach((surah) => {
        items.push({ type: "surah", surah });
      });
    });
    return items;
  };

  // Calculate sticky header indices
  const stickyHeaderIndices = flatData()
    .map((item, index) => (item.type === "header" ? index : null))
    .filter((item) => item !== null) as number[];

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message={error?.message || t`Failed to load Juz list`} />
    );
  }

  if (!juzList || juzList.length === 0) {
    return <ErrorState message={t`No Juz found`} />;
  }

  return (
    <View className="flex-1 px-4 sm:px-8 pb-8">
      <View className="flex-1 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
        {Platform.OS === "web" ? (
          // Web: CSS Grid layout
          <View className="gap-6">
            {juzList?.map((juz) => (
              <JuzListItem key={juz.juz_number} juz={juz} />
            ))}
          </View>
        ) : (
          // Native: FlashList with section headers
          <FlashList
            data={flatData()}
            renderItem={({ item }) => {
              if (item.type === "header") {
                return (
                  <View className="py-3 px-2 bg-background">
                    <Text className="text-xl font-bold text-text-primary">
                      <Trans>Juz {item.juzNumber}</Trans>
                    </Text>
                  </View>
                );
              }

              // Render surah item
              const { surah } = item;

              return <SurahListItem surah={surah} />;
            }}
            keyExtractor={(item, index) =>
              item.type === "header"
                ? `header-${item.juzNumber}`
                : `surah-${item.surah.id}`
            }
            getItemType={(item) => item.type}
            stickyHeaderIndices={stickyHeaderIndices}
            drawDistance={500}
            accessible
            accessibilityRole="list"
            accessibilityLabel={t`List of Quran parts (Juz)`}
          />
        )}
      </View>
    </View>
  );
}
