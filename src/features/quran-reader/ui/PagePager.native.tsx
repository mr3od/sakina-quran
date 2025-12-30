import { TOTAL_PAGES } from "@/shared/constants/quran";
import React, { useEffect, useRef, useState } from "react";
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
  // PagerView is 0-indexed, but our domain (Quran pages) is 1-indexed
  const [activeIndex, setActiveIndex] = useState(page - 1);

  // We use a ref to track activeIndex so we can access the latest value inside useEffect
  // without adding it to the dependency array (which would cause conflicts with swipe gestures).
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Sync external page prop changes to the internal PagerView state
  useEffect(() => {
    const currentIndex = activeIndexRef.current;

    if (pagerRef.current && currentIndex !== page - 1) {
      const diff = Math.abs(currentIndex - (page - 1));

      // Skip animation for large jumps (e.g. from search or index) for better UX
      if (diff > 1) {
        pagerRef.current.setPageWithoutAnimation(page - 1);
      } else {
        pagerRef.current.setPage(page - 1);
      }
      setActiveIndex(page - 1);
    }
  }, [page]);

  // Handle user swiping
  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    const newIndex = e.nativeEvent.position;
    setActiveIndex(newIndex);

    // Notify parent to update URL/Header
    // We send newIndex + 1 because domain logic is 1-indexed
    if (onPageChange) {
      onPageChange(newIndex + 1);
    }
  };

  // Generate the array of pages once
  // We use a sliding window: only render content if within range
  const pages = Array.from({ length: TOTAL_PAGES });

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={page - 1}
      onPageSelected={handlePageSelected}
      // optimization: offscreenLimit dictates how many pages ViewPager keeps attached
      offscreenPageLimit={1}
    >
      {pages.map((_, index) => {
        // Sliding Window Logic:
        // Render current page, previous one, and next one.
        // Everything else is an empty View to save massive memory.
        const shouldRenderContent = Math.abs(activeIndex - index) <= 1;

        return (
          <View key={index} style={{ flex: 1 }}>
            {shouldRenderContent ? renderPage(index + 1) : null}
          </View>
        );
      })}
    </PagerView>
  );
}
