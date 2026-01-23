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

  return (
    <View
      className={`bg-surface rounded-lg p-4 md:p-8 group mx-4 md:mx-auto md:max-w-4xl ${
        highlighted ? "bg-surface-highlight border border-primary/50" : ""
      }`}
    >
      <View className="flex-row items-center justify-between mb-6">
        <View
          className="w-10 h-10 rounded-full border border-border-base bg-background items-center justify-center"
          accessible
          accessibilityLabel={t`Verse number ${ayah.ayah_number}`}
        >
          <Text className="text-base font-semibold text-text-tertiary">
            <Trans>{ayah.ayah_number}</Trans>
          </Text>
        </View>

        {/* Bookmark button - faded until hover */}
        <Pressable
          onPress={handleToggleBookmark}
          disabled={isPending}
          className="
            p-2 rounded-md 
            active:opacity-50
            hover:bg-surface-elevated
            opacity-60 hover:opacity-100
            transition-opacity duration-200
          "
          style={{ minWidth: 44, minHeight: 44 }}
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
              size={24}
              className={isBookmarked ? "text-accent" : "text-text-secondary"}
            />
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={onPress}
        accessible
        accessibilityLabel={t`Verse ${ayah.ayah_number} of Surah ${ayah.sura_number}`}
      >
        <Text
          className="font-arabic text-text-quran text-right text-2xl md:text-3xl lg:text-4xl leading-[2.2]"
          selectable
          accessible
          accessibilityLanguage="ar"
          accessibilityLabel={ayah.uthmani_text}
        >
          {ayah.uthmani_text}
          <Text className="text-transparent"> </Text>
          <Text className="font-arabic font-medium text-text-quran text-2xl md:text-3xl lg:text-4xl">
            {toArabicIndic(ayah.ayah_number)}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
