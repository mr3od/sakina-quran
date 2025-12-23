import { TOTAL_PAGES } from "@/shared/constants/quran";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { toPageRoute } from "../app/quran-reader-route";
import { usePrefetchPageAyahs } from "../app/usePageData";
import { PagePage } from "./PagePage";
import { PagePager } from "./PagePager";

export function PageReaderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ number?: string }>();
  const prefetchPage = usePrefetchPageAyahs();

  // Fallback to 1 if undefined
  const currentPage = params.number ? parseInt(params.number, 10) : 1;

  // Handle Swipe Navigation
  const handlePageChange = (newPage: number) => {
    // 1. Update the URL params without pushing a new history stack item immediately
    // or causing a full unmount. 'setParams' is lighter than 'replace'.
    router.setParams({ number: String(newPage) });

    // 2. Prefetch data for the NEXT page (direction of travel)
    // If going forward (newPage > currentPage), fetch newPage + 1
    // If going backward, fetch newPage - 1
    const nextPrefetch = newPage > currentPage ? newPage + 1 : newPage - 1;
    if (nextPrefetch >= 1 && nextPrefetch <= TOTAL_PAGES) {
      prefetchPage(nextPrefetch);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-4 py-3 border-b border-border-subtle bg-surface">
        <View className="flex-row items-center justify-between">
          {/* Previous Page Link - Controlled by URL */}
          <Link
            href={toPageRoute(Math.max(1, currentPage - 1))}
            replace
            asChild
            disabled={currentPage <= 1}
          >
            <Text
              style={{ minWidth: 44, minHeight: 44 }}
              className={`font-ui-en text-base text-text-primary ${
                currentPage <= 1 ? "opacity-40" : ""
              }`}
            >
              Prev
            </Text>
          </Link>

          <Text className="font-ui-en text-sm text-text-secondary">
            Page {currentPage} / {TOTAL_PAGES}
          </Text>

          {/* Next Page Link - Controlled by URL */}
          <Link
            href={toPageRoute(Math.min(TOTAL_PAGES, currentPage + 1))}
            replace
            asChild
            disabled={currentPage >= TOTAL_PAGES}
          >
            <Text
              style={{ minWidth: 44, minHeight: 44, textAlign: "right" }}
              className={`font-ui-en text-base text-text-primary ${
                currentPage >= TOTAL_PAGES ? "opacity-40" : ""
              }`}
            >
              Next
            </Text>
          </Link>
        </View>
      </View>

      <PagePager
        page={currentPage}
        renderPage={(pageNumber: number) => (
          <PagePage pageNumber={pageNumber} />
        )}
        onPageChange={handlePageChange}
      />
    </View>
  );
}
