import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";

import { ProgressRepository } from "@/entities/reading-progress/api/ProgressRepository";
import { useSurahs } from "@/hooks/useSurahs";
import { parsePageNumber } from "@/shared/lib/quran-navigation";
import { SettingsDrawer } from "../../../components/layout/SettingsDrawer"; // restore for web header
import { toPageRoute } from "../app/quran-reader-route";
import { usePageAyahs, usePrefetchPageAyahs } from "../app/usePageData";
import { PagePage } from "./PagePage";
import { PagePager } from "./PagePager";

import { TOTAL_PAGES } from "@/shared/constants/quran";

type ScrollMetrics = {
  y: number;
  contentHeight: number;
  viewportHeight: number;
};

export function PageReaderScreen() {
  const { t, i18n } = useLingui();
  const isAr = i18n.locale === "ar";
  const router = useRouter();
  const params = useLocalSearchParams<{ number?: string }>();

  const textColor = useCSSVariable("--color-text-primary");
  const borderColor = useCSSVariable("--color-border-subtle");
  const bgColor = useCSSVariable("--color-background");
  const insets = useSafeAreaInsets();

  const currentPage = parsePageNumber(params.number, 1);
  const currentPageRef = React.useRef(currentPage);

  React.useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const { data: pageData } = usePageAyahs(currentPage);
  const { data: surahs } = useSurahs();
  const prefetchPage = usePrefetchPageAyahs();

  const firstAyah = pageData?.ayahs?.[0];
  const activeSurah = surahs?.find((s) => s.id === firstAyah?.sura_number);
  const juzNumber = pageData?.meta?.juz_number;

  // Save reading progress whenever page changes
  React.useEffect(() => {
    const repo = new ProgressRepository();
    repo.updateLastReadPosition(currentPage).catch(console.error);
  }, [currentPage]);

  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const lastScrollY = useSharedValue(0);

  const nativeHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.get() }],
    opacity: headerOpacity.get(),
  }));

  const webCompact = useSharedValue(0); // 0 = expanded, 1 = compact
  const webProgress = useSharedValue(0); // 0..1

  const webHeaderStyle = useAnimatedStyle(() => {
    // expanded ~ 64px, compact ~ 44px
    const height = 64 - webCompact.get() * 20;
    return { height };
  });

  const webProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, webProgress.get())) * 100}%`,
  }));

  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;

  const webCompactSideStyle = useAnimatedStyle(() => {
    // Always show on desktop screens
    if (!isSmallScreen) {
      return { opacity: 1, display: "flex" as const };
    }

    const compactValue = webCompact.get();
    return {
      opacity: 1 - compactValue,
      display: compactValue > 0.9 ? ("none" as const) : ("flex" as const),
      transform: [{ scale: 1 - compactValue * 0.1 }],
    };
  });

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      router.setParams({ number: String(newPage) });

      const direction = newPage > currentPageRef.current ? 1 : -1;
      const nextPrefetch = newPage + direction;

      if (nextPrefetch >= 1 && nextPrefetch <= TOTAL_PAGES)
        prefetchPage(nextPrefetch);

      currentPageRef.current = newPage;

      // reset animations/state
      lastScrollY.set(0);
      headerTranslateY.set(withTiming(0, { duration: 250 }));
      headerOpacity.set(withTiming(1, { duration: 200 }));

      webCompact.set(withTiming(0, { duration: 200 }));
      webProgress.set(0);
    },
    [
      headerOpacity,
      headerTranslateY,
      lastScrollY,
      prefetchPage,
      router,
      webCompact,
      webProgress,
    ],
  );

  // Keyboard navigation for web
  React.useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft": {
          const next = currentPageRef.current + (isAr ? 1 : -1);
          if (next >= 1 && next <= TOTAL_PAGES) handlePageChange(next);
          break;
        }
        case "ArrowRight": {
          const next = currentPageRef.current + (isAr ? -1 : 1);
          if (next >= 1 && next <= TOTAL_PAGES) handlePageChange(next);
          break;
        }
        case "PageUp": {
          e.preventDefault();
          const next = currentPageRef.current - 1;
          if (next >= 1) handlePageChange(next);
          break;
        }
        case "PageDown": {
          e.preventDefault();
          const next = currentPageRef.current + 1;
          if (next <= TOTAL_PAGES) handlePageChange(next);
          break;
        }
        case "Home":
          e.preventDefault();
          handlePageChange(1);
          break;
        case "End":
          e.preventDefault();
          handlePageChange(TOTAL_PAGES);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isAr, handlePageChange]);

  // Called by PagePage
  const onScroll = (m: ScrollMetrics) => {
    "worklet";

    // progress (web only needs it, but harmless elsewhere)
    const max = Math.max(1, m.contentHeight - m.viewportHeight);
    const p = m.y / max;
    webProgress.set(p);

    if (Platform.OS === "web") {
      // minimize, never hide
      const shouldCompact = m.y > 24;
      webCompact.set(withTiming(shouldCompact ? 1 : 0, { duration: 180 }));
      return;
    }

    // Native: keep your hide/show behavior
    const diff = m.y - lastScrollY.get();
    lastScrollY.set(m.y);

    if (Math.abs(diff) < 5) return;

    if (diff > 0 && m.y > 50) {
      if (headerTranslateY.get() === 0) {
        headerTranslateY.set(withTiming(-80, { duration: 250 }));
        headerOpacity.set(withTiming(0, { duration: 200 }));
      }
    } else if (diff < 0) {
      if (headerTranslateY.get() !== 0) {
        headerTranslateY.set(withTiming(0, { duration: 250 }));
        headerOpacity.set(withTiming(1, { duration: 200 }));
      }
    }
  };

  const surahTitle = useMemo(() => {
    if (!activeSurah) return "";
    return isAr ? activeSurah.name_arabic : activeSurah.name_simple;
  }, [activeSurah, isAr]);

  return (
    <View className="flex-1 bg-background">
      {Platform.OS !== "web" && (
        <Animated.View
          style={[
            nativeHeaderStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              paddingTop: Platform.select({ android: 0, default: insets.top }),
              zIndex: 50,
              backgroundColor: bgColor as string,
              borderBottomWidth: 1,
              borderBottomColor: borderColor as string,
            },
          ]}
          pointerEvents="auto"
        >
          <View className="px-4 py-3">
            <View className="flex-row items-center justify-between mx-auto w-full max-w-4xl">
              <Pressable
                className="p-2 rounded-full active:bg-surface-elevated self-start"
                accessibilityLabel={t`Go back`}
                onPressIn={() => router.back()}
              >
                <Ionicons
                  name={isAr ? "arrow-forward" : "arrow-back"}
                  size={24}
                  color={textColor as string}
                />
              </Pressable>

              <View className="flex-1 items-center px-4">
                <Text
                  className={`text-base font-semibold text-text-primary ${isAr ? "font-ui-ar" : "font-ui-en"}`}
                >
                  {surahTitle}
                </Text>
              </View>
              <Text className="text-xs text-text-secondary mt-0.5">
                <Trans>Page {currentPage}</Trans>
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* -------------------- Web header (restore old UI/UX + minimize + progress) -------------------- */}
      {Platform.OS === "web" && (
        <Animated.View
          className="border-b bg-background z-20"
          style={[
            webHeaderStyle,
            {
              borderBottomColor: borderColor as string,
              overflow: "hidden",
            },
          ]}
        >
          <View className="px-4 h-full justify-center">
            <View className="flex-row items-center justify-between mx-auto w-full max-w-5xl">
              {/* Left: Branding (old behavior) */}
              <Animated.View style={webCompactSideStyle}>
                <Link href="/" asChild>
                  <Pressable className="flex-row items-center gap-2">
                    <Text className="text-xl font-semibold text-text-primary tracking-tight">
                      <Trans>Sakina Quran</Trans>
                    </Text>
                  </Pressable>
                </Link>
              </Animated.View>

              {/* Center: old meta line + navigation */}
              <View className="flex-1 items-center px-4">
                <View className="flex-row items-center gap-4">
                  <Link
                    href={toPageRoute(Math.max(1, currentPage - 1))}
                    replace
                    asChild
                    disabled={currentPage <= 1}
                  >
                    <Pressable
                      className={`p-2 rounded-full hover:bg-surface-elevated active:scale-95 transition-all ${currentPage <= 1 ? "opacity-20 pointer-events-none" : "opacity-70 hover:opacity-100"}`}
                      accessibilityLabel={t`Previous Page`}
                    >
                      <Ionicons
                        name={isAr ? "chevron-forward" : "chevron-back"}
                        size={22}
                        color={textColor as string}
                      />
                    </Pressable>
                  </Link>

                  <Text
                    className={`text-sm sm:text-base font-medium text-text-primary ${isAr ? "font-ui-ar" : "font-ui-en"}`}
                  >
                    {[
                      juzNumber ? t`Juz ${juzNumber}` : null,
                      surahTitle || null,
                      t`Page ${currentPage}`,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>

                  <Link
                    href={toPageRoute(Math.min(TOTAL_PAGES, currentPage + 1))}
                    replace
                    asChild
                    disabled={currentPage >= TOTAL_PAGES}
                  >
                    <Pressable
                      className={`p-2 rounded-full hover:bg-surface-elevated active:scale-95 transition-all ${currentPage >= TOTAL_PAGES ? "opacity-20 pointer-events-none" : "opacity-70 hover:opacity-100"}`}
                      accessibilityLabel={t`Next Page`}
                    >
                      <Ionicons
                        name={isAr ? "chevron-back" : "chevron-forward"}
                        size={22}
                        color={textColor as string}
                      />
                    </Pressable>
                  </Link>
                </View>
              </View>

              {/* Right: utilities (old behavior) */}
              <Animated.View
                className="flex-row items-center gap-1 sm:gap-2"
                style={webCompactSideStyle}
              >
                <Link href="/(tabs)/bookmarks" asChild>
                  <Pressable className="p-2 rounded-full hover:bg-surface-elevated opacity-70">
                    <Ionicons
                      name="bookmark-outline"
                      size={20}
                      color={textColor as string}
                    />
                  </Pressable>
                </Link>
                <SettingsDrawer />
              </Animated.View>
            </View>
          </View>

          {/* thin progress bar at bottom */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 2,
              backgroundColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Animated.View
              style={[
                webProgressStyle,
                {
                  height: 2,
                  backgroundColor: textColor as string,
                },
              ]}
            />
          </View>
        </Animated.View>
      )}

      {/* Content */}
      <PagePager
        page={currentPage}
        renderPage={(pageNumber: number) => (
          <PagePage
            pageNumber={pageNumber}
            onScroll={onScroll}
            headerHeight={Platform.OS !== "web" ? 56 + insets.top : 0}
          />
        )}
        onPageChange={handlePageChange}
      />
    </View>
  );
}
