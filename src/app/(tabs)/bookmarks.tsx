/**
 * Bookmarks Screen - Thin UI Layer
 * Displays user's saved bookmarks with navigation and delete actions
 */

import { useBookmarksController } from "@/features/bookmarks/app";
import { BookmarkListItem } from "@/features/bookmarks/ui/BookmarkListItem";
import { useSurahs } from "@/hooks/useSurahs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import Head from "expo-router/head";
import { FlatList, Text, View } from "react-native";

export default function BookmarksScreen() {
  const { t, i18n } = useLingui();
  const isAr = i18n.locale === "ar";
  const { data: bookmarks, isLoading, error } = useBookmarksController();
  const { data: surahs } = useSurahs();

  // Helper to get Surah name
  const getSurahName = (suraNumber: number): string => {
    const surah = surahs?.find((s) => s.id === suraNumber);
    if (!surah) return t`Surah ${suraNumber}`;
    return isAr ? surah.name_arabic : surah.name_simple;
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState message={error?.message || t`Failed to load bookmarks`} />
    );
  }

  // Empty state
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-text-primary text-2xl mb-2">
          <Trans>No Bookmarks Yet</Trans>
        </Text>
        <Text className="text-text-secondary text-sm text-center">
          <Trans>
            Tap the bookmark icon on any verse to save it here for quick access.
          </Trans>
        </Text>
      </View>
    );
  }

  // Loaded state
  return (
    <View className="flex-1 bg-background">
      <Head>
        <title>{t`Bookmarks - Sakina Quran`}</title>
        <meta
          name="description"
          content={t`Access your saved Quran verses and bookmarks. Quickly navigate to your favorite Ayahs and continue reading from where you left off.`}
        />
        <meta
          name="keywords"
          content="Quran bookmarks, saved verses, favorite Ayahs, reading progress"
        />

        {/* Open Graph */}
        <meta property="og:title" content={t`Bookmarks - Sakina Quran`} />
        <meta
          property="og:description"
          content={t`Access your saved Quran verses and bookmarks.`}
        />
        <meta property="og:url" content="https://quran.mr3od.dev/bookmarks" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://quran.mr3od.dev/bookmarks" />
      </Head>
      {/* Header */}
      <View className="p-4 border-b border-border">
        <Text className="text-text-primary text-2xl mb-1">
          <Trans>Bookmarks</Trans>
        </Text>
        <Text className="text-text-secondary text-sm">
          <Plural
            value={bookmarks.length}
            one="# bookmark"
            other="# bookmarks"
          />
        </Text>
      </View>

      {/* Bookmarks list */}
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => `${item.sura}:${item.ayah}`}
        renderItem={({ item }) => (
          <BookmarkListItem
            bookmark={item}
            surahName={getSurahName(item.sura)}
          />
        )}
        contentContainerClassName="p-4"
      />
    </View>
  );
}
