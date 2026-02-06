import React from "react";
import { View } from "react-native";

type Props = {
  page: number;
  onPageChange?: (page: number) => void;
  renderPage: (pageNumber: number) => React.ReactNode;
};

export function PagePager({ page, renderPage }: Props) {
  // On web, we render exactly one page.
  // Navigation is handled by the parent using URL changes.
  return <View className="flex-1 w-full">{renderPage(page)}</View>;
}
