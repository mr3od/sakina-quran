import { useBookmarksController } from "@/features/bookmarks/app";
import { useSurahs } from "@/hooks/useSurahs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { BookmarkHomeCard } from "./BookmarkHomeCard";

export function LatestBookmarks() {
  const { i18n, t } = useLingui();
  const isAr = i18n.locale === "ar";
  const { data: bookmarks, isLoading: isBookmarksLoading } =
    useBookmarksController();
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();

  const isLoading = isBookmarksLoading || isSurahsLoading;

  if (isLoading) {
    return (
      <View className="bg-surface border border-border rounded-xl p-6 items-center justify-center min-h-30">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <View className="bg-surface border border-border rounded-xl p-6">
        <Text className="text-sm text-text-secondary text-center">
          <Trans>Your bookmarked verses will appear here</Trans>
        </Text>
      </View>
    );
  }

  // Show only 2 most recent bookmarks to balance the dashboard height
  const latestBookmarks = bookmarks.slice(0, 2);

  return (
    <View className="gap-3">
      {latestBookmarks.map((bookmark) => {
        const surah = surahs?.find((s) => s.id === bookmark.sura);
        const surahName = surah
          ? isAr
            ? surah.name_arabic
            : surah.name_simple
          : t`Surah ${bookmark.sura}`;

        return (
          <BookmarkHomeCard
            key={`${bookmark.sura}:${bookmark.ayah}`}
            sura={bookmark.sura}
            ayah={bookmark.ayah}
            page={bookmark.page}
            surahName={surahName}
          />
        );
      })}

      {bookmarks.length > 2 && (
        <Link href="/bookmarks" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t`View all bookmarks`}
          >
            <Text className="text-accent text-sm font-medium text-center mt-1">
              <Trans>View all bookmarks ({bookmarks.length})</Trans>
            </Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}
