/**
 * Public API exports for Quran Reader feature
 */

// App layer - New controller
export { toAyahRoute, toPageRoute } from "./quran-reader-route";
export { usePageAyahs, usePrefetchPageAyahs } from "./usePageData";
export { usePrefetchAdjacentPages } from "./usePrefetchAdjacentPages";
export { useReaderController } from "./useReaderController";

// Domain layer

export { clampPage, parsePageParam } from "../domain/page";
export type {
  PageMetadata,
  PageReaderParams,
  PageReaderState,
  ReadingProgress,
} from "../domain/types";
