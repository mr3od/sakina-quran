import { useAyahCardLogic } from "@/features/bookmarks/app";
import { toArabicIndic } from "@/shared/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
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
  const { isBookmarked, handleToggleBookmark, isPending } = useAyahCardLogic(
    ayah,
    page
  );

  return (
    <View
      className={`bg-surface rounded-lg p-6 border ${
        highlighted
          ? "bg-surface-highlight border-primary/50"
          : "border-border-subtle"
      }`}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View
          className="w-8 h-8 rounded-full border border-border-base bg-background items-center justify-center"
          accessible
          accessibilityLabel={`Verse number ${ayah.ayah_number}`}
        >
          <Text className="font-ui-en text-sm font-semibold text-text-tertiary">
            {ayah.ayah_number}
          </Text>
        </View>

        {/* Bookmark button */}
        <Pressable
          onPress={handleToggleBookmark}
          disabled={isPending}
          className="p-2 rounded-md active:opacity-50"
          style={{ minWidth: 44, minHeight: 44 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          accessibilityHint="Double tap to toggle bookmark"
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
        accessibilityLabel={`Verse ${ayah.ayah_number} of Surah ${ayah.sura_number}`}
      >
        <Text
          className="font-arabic text-text-quran text-right"
          style={{ fontSize: 30, lineHeight: 30 * 2.2 }}
          selectable
          accessible
          accessibilityLanguage="ar"
          accessibilityLabel={ayah.uthmani_text}
        >
          {ayah.uthmani_text}
          <Text className="text-transparent"> </Text>
          <Text
            className="font-arabic font-medium text-text-quran"
            style={{ fontSize: 34 }}
          >
            {toArabicIndic(ayah.ayah_number)}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}
