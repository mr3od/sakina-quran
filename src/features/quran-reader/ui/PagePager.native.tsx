import { TOTAL_PAGES } from "@/shared/constants/quran";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";

type Props = {
  page: number; // The current page from URL/Props
  onPageChange?: (page: number) => void;
  renderPage: (pageNumber: number) => React.ReactNode;
};

export function PagePager({ page, onPageChange, renderPage }: Props) {
  const pagerRef = useRef<PagerView>(null);
  const lastSyncedPage = useRef(page);
  const isSyncingFromSwipe = useRef(false);

  // Sync external page prop changes to the internal PagerView state
  useEffect(() => {
    if (isSyncingFromSwipe.current) {
      isSyncingFromSwipe.current = false;
      return;
    }

    if (pagerRef.current && lastSyncedPage.current !== page) {
      const diff = Math.abs(lastSyncedPage.current - page);

      // Skip animation for large jumps (e.g. from search or index) for better UX
      if (diff > 1) {
        pagerRef.current.setPageWithoutAnimation(page - 1);
      } else {
        pagerRef.current.setPage(page - 1);
      }
      lastSyncedPage.current = page;
    }
  }, [page]);

  // Handle user swiping
  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    const newPage = e.nativeEvent.position + 1;
    if (newPage === lastSyncedPage.current) return;

    isSyncingFromSwipe.current = true;
    lastSyncedPage.current = newPage;

    // Notify parent to update URL/Header
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={page - 1}
      onPageSelected={handlePageSelected}
      offscreenPageLimit={1}
    >
      {Array.from({ length: TOTAL_PAGES }, (_, index) => {
        // Sliding Window Logic:
        // Render current page, previous one, and next one.
        // Everything else is an empty View to save massive memory.
        const shouldRenderContent = Math.abs(page - 1 - index) <= 1;

        return (
          <View key={index} style={{ flex: 1 }}>
            {shouldRenderContent ? renderPage(index + 1) : null}
          </View>
        );
      })}
    </PagerView>
  );
}
