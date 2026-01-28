// src/components/quran/AyahCard.tsx

import { useAyahCardLogic } from "@/features/bookmarks/app";
import { toArabicIndic } from "@/shared/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { Ayah } from "../../types/quran.types";

interface AyahCardProps {
  ayah: Ayah;
  page?: number;
  onPress?: () => void;
  highlighted?: boolean;
}

export function AyahCard({ ayah, page, onPress, highlighted }: AyahCardProps) {
  const { t } = useLingui();
  const { isBookmarked, handleToggleBookmark, isPending } = useAyahCardLogic(
    ayah,
    page,
  );

  // Compute container classes for better readability
  const containerClasses = [
    "flex-row justify-between py-8 w-full px-4 sm:px-8 group relative",
    "after:content-[''] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-border-subtle/30",
    highlighted && "bg-surface-highlight",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <View className={containerClasses}>
      {/* 
        Constrained content wrapper 
        - flex-row: Standard row (Left -> Right in LTR, Right -> Left in RTL)
        - rtl:flex-row-reverse: In RTL, flip it back to Left -> Right visually.
        This ensures the controls are always on the left and text on the right.
      */}
      <View className="flex-row rtl:flex-row-reverse justify-between w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <View className="flex flex-col justify-start items-center gap-4">
          <View
            className="w-8 h-8 rounded-full border border-border-base bg-background items-center justify-center"
            accessible
            accessibilityLabel={t`Verse number ${ayah.ayah_number}`}
          >
            <Text className="text-xs font-medium text-text-tertiary">
              <Trans>{ayah.ayah_number}</Trans>
            </Text>
          </View>

          {/* Bookmark button*/}
          <Pressable
            onPress={handleToggleBookmark}
            disabled={isPending}
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-50"
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked ? t`Remove bookmark` : t`Add bookmark`
            }
            accessibilityHint={t`Double tap to toggle bookmark`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                className={isBookmarked ? "text-accent" : "text-text-secondary"}
              />
            )}
          </Pressable>
        </View>
        <Pressable
          className="ml-8 flex-1 min-w-0"
          onPress={onPress}
          accessible
          accessibilityLabel={t`Verse ${ayah.ayah_number} of Surah ${ayah.sura_number}`}
        >
          <Text
            className="font-arabic text-text-quran text-right text-3xl md:text-4xl lg:text-5xl leading-quran"
            selectable
            accessible
            accessibilityLanguage="ar"
            accessibilityLabel={ayah.uthmani_text}
          >
            {ayah.uthmani_text}
            <Text className="text-transparent"> </Text>
            <Text className="font-arabic font-medium text-text-quran text-xl md:text-2xl">
              {toArabicIndic(ayah.ayah_number)}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
