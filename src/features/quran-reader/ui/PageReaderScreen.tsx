/** src/features/quran-reader/ui/PageReaderScreen.tsx */
import { Link, Stack } from "expo-router"; // Import Link
import React from "react";
import { Text, View } from "react-native";
import { toPageRoute } from "../app/quran-reader-route"; // Helper for paths
import { usePrefetchAdjacentPages } from "../app/usePrefetchAdjacentPages";
import { useReaderController } from "../app/useReaderController";
import { PagePage } from "./PagePage";
import { PagePager } from "./PagePager";

export function PageReaderScreen() {
  const { currentPage, totalPages, commitPage } = useReaderController();

  usePrefetchAdjacentPages(currentPage, 2);

  const renderPage = (pageNumber: number) => (
    <PagePage pageNumber={pageNumber} />
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-4 py-3 border-b border-border-subtle bg-surface">
        <View className="flex-row items-center justify-between">
          {/* Previous Page Link */}
          <Link
            href={toPageRoute(Math.max(1, currentPage - 1))}
            replace // Use replace to avoid polluting history on every flip
            asChild
            disabled={currentPage <= 1}
          >
            <Text
              style={{ minWidth: 44, minHeight: 44 }}
              className={`font-ui-en text-base text-text-primary ${currentPage <= 1 ? "opacity-40" : ""}`}
            >
              Prev
            </Text>
          </Link>

          <Text className="font-ui-en text-sm text-text-secondary">
            Page {currentPage} / {totalPages}
          </Text>

          {/* Next Page Link */}
          <Link
            href={toPageRoute(Math.min(totalPages, currentPage + 1))}
            replace
            asChild
            disabled={currentPage >= totalPages}
          >
            <Text
              style={{ minWidth: 44, minHeight: 44, textAlign: "right" }}
              className={`font-ui-en text-base text-text-primary ${currentPage >= totalPages ? "opacity-40" : ""}`}
            >
              Next
            </Text>
          </Link>
        </View>
      </View>

      <PagePager
        page={currentPage}
        totalPages={totalPages}
        windowSize={5}
        onPageSettled={commitPage}
        renderPage={renderPage}
      />
    </View>
  );
}
