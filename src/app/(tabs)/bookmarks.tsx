/**
 * Bookmarks Screen - Thin UI Layer
 * Displays user's saved bookmarks with navigation and delete actions
 */

import { useBookmarksController } from "@/features/bookmarks/app";
import { BookmarkListItem } from "@/features/bookmarks/ui/BookmarkListItem";
import { useSurahs } from "@/hooks/useSurahs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import Head from "expo-router/head";
import { FlatList, Text, View } from "react-native";

export default function BookmarksScreen() {
  const { data: bookmarks, isLoading, error } = useBookmarksController();
  const { data: surahs } = useSurahs();

  // Helper to get Surah name
  const getSurahName = (suraNumber: number): string => {
    const surah = surahs?.find((s) => s.id === suraNumber);
    return surah?.name_arabic || `Surah ${suraNumber}`;
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState message={error?.message || "Failed to load bookmarks"} />
    );
  }

  // Empty state
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Text className="text-text-primary font-ui-ar text-2xl mb-2">
          لا توجد علامات مرجعية
        </Text>
        <Text className="text-text-primary font-ui-en text-lg mb-4">
          No Bookmarks Yet
        </Text>
        <Text className="text-text-secondary font-ui-en text-sm text-center">
          Tap the bookmark icon on any verse to save it here for quick access.
        </Text>
      </View>
    );
  }

  // Loaded state
  return (
    <View className="flex-1 bg-background">
      <Head>
        <title>Bookmarks - Sakina Quran</title>
        <meta
          name="description"
          content="Access your saved Quran verses and bookmarks. Quickly navigate to your favorite Ayahs and continue reading from where you left off."
        />
        <meta
          name="keywords"
          content="Quran bookmarks, saved verses, favorite Ayahs, reading progress"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Bookmarks - Sakina Quran" />
        <meta
          property="og:description"
          content="Access your saved Quran verses and bookmarks."
        />
        <meta property="og:url" content="https://quran.mr3od.dev/bookmarks" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://quran.mr3od.dev/bookmarks" />
      </Head>
      {/* Header */}
      <View className="p-4 border-b border-border">
        <Text className="text-text-primary font-ui-ar text-2xl mb-1">
          العلامات المرجعية
        </Text>
        <Text className="text-text-secondary font-ui-en text-sm">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
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
