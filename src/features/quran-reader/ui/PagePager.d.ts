/**
 * Type declarations for platform-specific PagePager
 * Metro resolves .native.tsx or .web.tsx at runtime,
 * but TypeScript needs this declaration file
 */

import React from "react";

type Props = {
  page: number;
  onPageChange?: (page: number) => void;
  renderPage: (pageNumber: number) => React.ReactNode;
};

export function PagePager(props: Props): React.JSX.Element;
