/**
 * Shared windowing logic for the Pager.
 * Calculates the range of pages to render based on current page and window size.
 */
export function getWindow(
  page: number,
  totalPages: number,
  windowSize: number,
) {
  const size = Math.max(1, windowSize | 0);
  const oddSize = size % 2 === 1 ? size : size + 1;
  // Clamp to totalPages to handle edge cases where window > total
  const clampedSize = Math.min(oddSize, totalPages);
  const half = Math.floor(clampedSize / 2);

  const maxStart = Math.max(1, totalPages - clampedSize + 1);
  const start = Math.min(maxStart, Math.max(1, page - half));
  const pages = Array.from({ length: clampedSize }, (_, i) => start + i);
  const selectedIndex = page - start;

  return { pages, selectedIndex };
}
