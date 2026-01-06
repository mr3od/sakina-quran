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
      className={`flex-row justify-between py-8 w-full px-4 sm:px-8 group relative ${
        highlighted ? "bg-surface-highlight" : ""
      } after:content-[''] after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-border-subtle/30`}
    >
      {/* Constrained content wrapper */}
      <View className="flex-row justify-between w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <View className="flex flex-col justify-start items-center gap-4">
          <View
            className="w-10 h-10 rounded-full border border-border-base bg-background items-center justify-center"
            accessible
            accessibilityLabel={`Verse number ${ayah.ayah_number}`}
          >
            <Text className="font-ui-en text-base font-semibold text-text-tertiary">
              {ayah.ayah_number}
            </Text>
          </View>

          {/* Bookmark button - faded until hover */}
          <Pressable
            onPress={handleToggleBookmark}
            disabled={isPending}
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-50 opacity-60 hover:opacity-100 transition-opacity duration-200"
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked ? "Remove bookmark" : "Add bookmark"
            }
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
          className="ml-8 flex-1 min-w-0"
          onPress={onPress}
          accessible
          accessibilityLabel={`Verse ${ayah.ayah_number} of Surah ${ayah.sura_number}`}
        >
          <Text
            className="font-arabic text-text-quran text-right text-3xl md:text-4xl lg:text-5xl leading-[2.2]"
            selectable
            accessible
            accessibilityLanguage="ar"
            accessibilityLabel={ayah.uthmani_text}
          >
            {ayah.uthmani_text}
            <Text className="text-transparent"> </Text>
            <Text className="font-arabic font-medium text-text-quran text-3xl md:text-4xl lg:text-5xl">
              {toArabicIndic(ayah.ayah_number)}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
