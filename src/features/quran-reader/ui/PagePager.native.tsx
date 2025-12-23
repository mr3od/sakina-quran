import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { getWindow } from "../domain/pager-window";

type Props = {
  page: number;
  totalPages: number;
  windowSize?: number; // must be odd; default 5
  onPageSettled: (page: number) => void;
  renderPage: (pageNumber: number) => React.ReactNode;
};

export function PagePager({
  page,
  totalPages,
  windowSize = 5,
  onPageSettled,
  renderPage,
}: Props) {
  const pagerRef = useRef<PagerView>(null);

  const { pages, selectedIndex } = getWindow(page, totalPages, windowSize);

  // Keep the visible child aligned when the window shifts.
  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(selectedIndex);
  }, [selectedIndex]);

  return (
    <PagerView
      ref={pagerRef}
      style={{ flex: 1 }}
      initialPage={selectedIndex}
      onPageSelected={(e) => {
        const index = e.nativeEvent.position;
        const nextPage = pages[index];
        // Guard: only fire if page actually changed
        if (typeof nextPage === "number" && nextPage !== page) {
          onPageSettled(nextPage);
        }
      }}
    >
      {pages.map((p) => (
        <View key={p} style={{ flex: 1 }}>
          {renderPage(p)}
        </View>
      ))}
    </PagerView>
  );
}
