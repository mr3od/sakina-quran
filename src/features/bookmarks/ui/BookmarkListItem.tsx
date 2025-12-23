/**
 * Presentation Layer - Bookmark List Item
 * Displays a single bookmark with navigation and delete actions
 */

import { useAyah } from "@/hooks/useAyah";
import { formatRelativeTime } from "@/shared/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRemoveBookmark } from "../app";
import { Bookmark } from "../domain/bookmark-contract";

interface BookmarkListItemProps {
  bookmark: Bookmark;
  surahName: string;
}

export function BookmarkListItem({
  bookmark,
  surahName,
}: BookmarkListItemProps) {
  // Fetch verse text from DB
  const { data: ayah, isLoading } = useAyah(bookmark.sura, bookmark.ayah);

  const removeBookmark = useRemoveBookmark();

  // Handle bookmark removal
  const handleRemove = (bookmark: Bookmark) => {
    removeBookmark.mutate({
      sura: bookmark.sura,
      ayah: bookmark.ayah,
    });
  };

  return (
    <Link
      href={`/pages/${bookmark.page}?surah=${bookmark.sura}&ayah=${bookmark.ayah}`}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Bookmark: Surah ${surahName}, Ayah ${bookmark.ayah}`}
        accessibilityHint="Double tap to navigate to verse"
        className="bg-bookmark border-border rounded-xl p-4 mb-2 active:bg-surface-elevated active:scale-99"
      >
        {/* Header: Metadata + Remove button */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-text-secondary font-ui-en text-xs">
              {surahName} • {bookmark.sura}:{bookmark.ayah}
            </Text>
          </View>

          {/* Remove button */}
          <Pressable
            onPress={() => handleRemove(bookmark)}
            accessibilityRole="button"
            accessibilityLabel="Remove bookmark"
            accessibilityHint="Double tap to delete this bookmark"
            className="p-2 active:opacity-50 -mr-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              className="text-text-tertiary"
            />
          </Pressable>
        </View>

        {/* Primary content: Verse text */}
        {isLoading ? (
          <View className="py-4">
            <ActivityIndicator size="small" />
          </View>
        ) : ayah ? (
          <Text
            className="font-arabic text-text-quran text-right mb-3"
            style={{ fontSize: 22, lineHeight: 22 * 1.8 }}
            numberOfLines={3}
            accessible
            accessibilityLanguage="ar"
          >
            {ayah.uthmani_text}
          </Text>
        ) : null}

        {/* Footer: Timestamp + Optional note */}
        <View className="flex-row items-center justify-between">
          <Text className="text-text-tertiary font-ui-en text-xs">
            {formatRelativeTime(bookmark.timestamp)}
          </Text>

          {bookmark.note && (
            <Text
              className="text-text-secondary font-ui-en text-xs italic"
              numberOfLines={1}
            >
              {bookmark.note}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
