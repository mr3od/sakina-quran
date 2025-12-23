import { Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Surah } from "../../types/quran.types";

interface SurahListItemProps {
  surah: Surah;
}

export function SurahListItem({ surah }: SurahListItemProps) {
  const revelationPlace =
    surah.revelation_place.charAt(0).toUpperCase() +
    surah.revelation_place.slice(1);

  const firstPage = parseInt(surah.pages_range.split("-")[0]);

  return (
    <Link href={`/pages/${firstPage}`} asChild>
      <Pressable
        className="
          p-4 
          border rounded-lg 
          bg-surface 
          border-border-subtle
          active:bg-surface-elevated active:border-border-base
        "
        style={{ minHeight: 80 }}
        accessibilityRole="button"
        accessibilityLabel={`Surah ${surah.id}, ${surah.name_simple}, ${revelationPlace}, ${surah.verses_count} verses`}
        accessibilityHint="Double tap to read this Surah"
      >
        <View
          className="
          flex-row
          gap-4
          "
        >
          <View
            className="w-12 h-12 rounded-lg bg-surface-elevated border border-border-base items-center justify-center self-center"
            accessible
            accessibilityLabel={`Surah number ${surah.id}`}
          >
            <Text className="font-ui-en text-base font-bold text-text-primary">
              {surah.id}
            </Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text
              className="font-ui-ar text-xl font-bold text-text-primary mb-1"
              numberOfLines={1}
              accessible
              accessibilityLanguage="ar"
            >
              {surah.name_arabic}
            </Text>
            <Text
              className="font-ui-en text-sm text-text-secondary mb-1"
              numberOfLines={1}
            >
              {surah.name_simple}
            </Text>
            <Text
              className="font-ui-en text-xs text-text-tertiary"
              numberOfLines={1}
            >
              {surah.name_complex}
            </Text>
          </View>
          <View className="items-end shrink-0">
            <View className="bg-surface-elevated px-3 py-1 rounded-full mb-2">
              <Text className="font-ui-en text-xs font-medium text-text-secondary">
                {revelationPlace}
              </Text>
            </View>
            <Text className="font-ui-en text-xs text-text-tertiary">
              {surah.verses_count} verses
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
