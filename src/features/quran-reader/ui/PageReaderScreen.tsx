import { useSurahs } from "@/hooks/useSurahs";
import { useUpdateReadingProgress } from "@/hooks/useUpdateReadingProgress";
import { TOTAL_PAGES } from "@/shared/constants/quran";
import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { SettingsDrawer } from "../../../components/layout/SettingsDrawer";
import { toPageRoute } from "../app/quran-reader-route";
import { usePageAyahs, usePrefetchPageAyahs } from "../app/usePageData";
import { PagePage } from "./PagePage";
import { PagePager } from "./PagePager";

export function PageReaderScreen() {
  const { t, i18n } = useLingui();

  const isAr = i18n.locale === "ar";
  const router = useRouter();
  const params = useLocalSearchParams<{ number?: string }>();
  const prefetchPage = usePrefetchPageAyahs();
  const updateProgress = useUpdateReadingProgress();

  const textColor = useCSSVariable("--color-text-primary");
  const borderColor = useCSSVariable("--color-border-subtle");

  // Fallback to 1 if undefined
  const currentPage = params.number ? parseInt(params.number, 10) : 1;

  // Fetch Metadata for Header
  const { data: pageData } = usePageAyahs(currentPage);
  const { data: surahs } = useSurahs();

  const firstAyah = pageData?.ayahs?.[0];
  const activeSurah = surahs?.find((s) => s.id === firstAyah?.sura_number);
  const juzNumber = pageData?.meta?.juz_number;

  // Update reading progress when page changes
  useEffect(() => {
    updateProgress(currentPage);
  }, [currentPage, updateProgress]);

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
      {/* Minimal Mushaf Header */}
      <View
        className="px-4 py-3 border-b bg-background z-20"
        style={{ borderBottomColor: borderColor as string }}
      >
        <View className="flex-row items-center justify-between mx-auto w-full">
          {/* Left: Branding */}
          <Link href="/" asChild>
            <Pressable className="flex-row items-center gap-2 hidden lg:flex">
              <Text className="text-xl font-semibold text-text-primary tracking-tight">
                <Trans>Sakina Quran</Trans>
              </Text>
            </Pressable>
          </Link>

          {/* Center: Context Navigation */}
          <View className="flex-1 flex-row items-center justify-center gap-1 sm:gap-4">
            <Link
              href={toPageRoute(Math.max(1, currentPage - 1))}
              replace
              asChild
              disabled={currentPage <= 1}
            >
              <Pressable
                className={`p-2 rounded-full hover:bg-surface-elevated ${
                  currentPage <= 1 ? "opacity-10" : "opacity-60"
                }`}
                accessibilityLabel={t`Previous Page`}
              >
                <Ionicons
                  name={isAr ? "chevron-forward" : "chevron-back"}
                  size={20}
                  color={textColor as string}
                />
              </Pressable>
            </Link>

            <View className="flex-row items-center px-4 py-1.5 rounded-full bg-surface-elevated/50 sm:bg-transparent">
              <Text
                className={`text-sm sm:text-base font-medium text-text-primary ${
                  isAr ? "font-ui-ar" : "font-ui-en"
                }`}
              >
                {[
                  juzNumber ? t`Juz ${juzNumber}` : null,
                  activeSurah
                    ? isAr
                      ? activeSurah.name_arabic
                      : activeSurah.name_simple
                    : null,
                  t`Page ${currentPage} of ${TOTAL_PAGES}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>

            <Link
              href={toPageRoute(Math.min(TOTAL_PAGES, currentPage + 1))}
              replace
              asChild
              disabled={currentPage >= TOTAL_PAGES}
            >
              <Pressable
                className={`p-2 rounded-full hover:bg-surface-elevated ${
                  currentPage >= TOTAL_PAGES ? "opacity-10" : "opacity-60"
                }`}
                accessibilityLabel={t`Next Page`}
              >
                <Ionicons
                  name={isAr ? "chevron-back" : "chevron-forward"}
                  size={20}
                  color={textColor as string}
                />
              </Pressable>
            </Link>
          </View>

          {/* Right: Utilities */}
          <View className="flex-row items-center gap-1 sm:gap-2">
            <Link href="/(tabs)/bookmarks" asChild>
              <Pressable className="p-2 rounded-full hover:bg-surface-elevated opacity-60">
                <Ionicons
                  name="bookmark-outline"
                  size={20}
                  color={textColor as string}
                />
              </Pressable>
            </Link>
            <SettingsDrawer />
          </View>
        </View>
      </View>

      {/* Page-Edge Navigation (Web/Desktop Hover) */}
      {Platform.OS === "web" && (
        <>
          <Link
            href={toPageRoute(Math.max(1, currentPage - 1))}
            replace
            asChild
            disabled={currentPage <= 1}
          >
            <Pressable
              className="absolute left-0 top-16 bottom-0 w-16 sm:w-24 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
              style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            >
              <View className="p-3 rounded-full bg-surface-elevated/80 shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                <Ionicons
                  name={isAr ? "chevron-forward" : "chevron-back"}
                  size={24}
                  color={textColor as string}
                />
              </View>
            </Pressable>
          </Link>
          <Link
            href={toPageRoute(Math.min(TOTAL_PAGES, currentPage + 1))}
            replace
            asChild
            disabled={currentPage >= TOTAL_PAGES}
          >
            <Pressable
              className="absolute right-0 top-16 bottom-0 w-16 sm:w-24 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
              style={{ backgroundColor: "rgba(0,0,0,0.02)" }}
            >
              <View className="p-3 rounded-full bg-surface-elevated/80 shadow-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                <Ionicons
                  name={isAr ? "chevron-back" : "chevron-forward"}
                  size={24}
                  color={textColor as string}
                />
              </View>
            </Pressable>
          </Link>
        </>
      )}

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
