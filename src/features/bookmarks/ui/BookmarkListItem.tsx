/**
 * Presentation Layer - Bookmark List Item
 * Displays a single bookmark with navigation and delete actions
 */

import { toPageRoute } from "@/features/quran-reader/app/quran-reader-route";
import { useAyah } from "@/hooks/useAyah";
import { useLocaleFont } from "@/hooks/useLocaleFont";
import { formatRelativeTime } from "@/shared/lib/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useLingui } from "@lingui/react/macro";
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
  const { t, i18n } = useLingui();
  const fontClass = useLocaleFont();
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
      href={toPageRoute(bookmark.page, bookmark.sura, bookmark.ayah)}
      asChild
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t`Bookmark: Surah ${surahName}, Ayah ${bookmark.ayah}`}
        accessibilityHint={t`Double tap to navigate to verse`}
        className="bg-bookmark border-border rounded-xl p-4 mb-2 active:bg-surface-elevated active:scale-99"
      >
        {/* Header: Metadata + Remove button */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className={`${fontClass} text-text-secondary text-xs`}>
              {surahName} • {bookmark.sura}:{bookmark.ayah}
            </Text>
          </View>

          {/* Remove button - faded until hover */}
          <Pressable
            onPress={(e) => {
              e.preventDefault?.();
              e.stopPropagation(); // prevent parent onPress/Link navigation
              handleRemove(bookmark);
            }}
            accessibilityRole="button"
            accessibilityLabel={t`Remove bookmark`}
            accessibilityHint={t`Double tap to delete this bookmark`}
            className="p-2 active:opacity-50 -mr-2 opacity-30 hover:opacity-100 transition-opacity duration-200"
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
            className="font-arabic text-text-quran mb-3"
            style={{
              fontSize: 22,
              lineHeight: 22 * 1.8,
              writingDirection: "rtl",
              // for android
              direction: "rtl",
            }}
            accessible
            accessibilityLanguage="ar"
          >
            {ayah.uthmani_text}
          </Text>
        ) : null}

        {/* Footer: Timestamp + Optional note */}
        <View className="flex-row items-center justify-between">
          <Text className="text-text-tertiary text-xs">
            {formatRelativeTime(new Date(bookmark.timestamp), i18n.locale)}
          </Text>

          {bookmark.note && (
            <Text
              className={`${fontClass} text-text-secondary text-xs italic`}
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
