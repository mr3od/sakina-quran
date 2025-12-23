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
      className={`flex-row justify-between py-6 border-b mx-auto w-full max-w-3xl ${
        highlighted
          ? "bg-surface-highlight border-primary/50"
          : "border-border-subtle"
      }`}
    >
      <View className="flex flex-col justify-items-start gap-2">
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
          className="w-8 h-8 rounded-full items-center justify-center active:opacity-50"
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
        className="ml-4 flex-1 min-w-0"
        onPress={onPress}
        accessible
        accessibilityLabel={`Verse ${ayah.ayah_number} of Surah ${ayah.sura_number}`}
      >
        <Text
          className="font-arabic text-text-quran text-right lg:text-4xl shrink leading-loose"
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
