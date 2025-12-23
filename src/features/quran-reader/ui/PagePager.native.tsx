import { TOTAL_PAGES } from "@/shared/constants/quran";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

type Props = {
  page: number; // The current page from URL/Props
  onPageChange?: (page: number) => void;
  renderPage: (pageNumber: number) => React.ReactNode;
};

export function PagePager({ page, onPageChange, renderPage }: Props) {
  const pagerRef = useRef<PagerView>(null);
  // Internal state to track what the user is currently looking at
  // We initialize with page - 1 because PagerView is 0-indexed
  const [activeIndex, setActiveIndex] = useState(page - 1);

  // Sync prop changes (e.g. Header "Next" button click) to PagerView
  useEffect(() => {
    if (pagerRef.current && activeIndex !== page - 1) {
      // Use setPageWithoutAnimation for large jumps, or setPage for neighbor
      const diff = Math.abs(activeIndex - (page - 1));
      if (diff > 1) {
        pagerRef.current.setPageWithoutAnimation(page - 1);
      } else {
        pagerRef.current.setPage(page - 1);
      }
      setActiveIndex(page - 1);
    }
  }, [page]);

  // Handle user swiping
  const handlePageSelected = (e: any) => {
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
