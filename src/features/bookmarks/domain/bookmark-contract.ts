/**
 * Bookmark entity with composite identity (sura:ayah)
 */
export interface Bookmark {
  sura: number;
  ayah: number;
  timestamp: number;
  page: number;
  /** Optional user annotation */
  note?: string;
}

/**
 * Composite identity for bookmarks: ${sura}:${ayah}
 */
export type BookmarkIdentity = `${number}:${number}`;

/**
 * BookmarkManager interface - defines contract for bookmark operations
 * Invariants:
 * - Identity: ${sura}:${ayah} must be unique
 * - Ordering: bookmarks MUST be sorted by timestamp DESC
 */
export interface BookmarkManager {
  /**
   * Get all bookmarks sorted by timestamp DESC
   * @returns Promise resolving to sorted bookmark array
   */
  getAll(): Promise<Bookmark[]>;

  /**
   * Add a bookmark (idempotent)
   * If bookmark exists, updates note and timestamp
   * @param sura - Surah number
   * @param ayah - Ayah number
   * @param note - Optional user annotation
   */
  add(sura: number, ayah: number, page: number, note?: string): Promise<void>;

  /**
   * Remove a bookmark (idempotent)
   * No error if bookmark doesn't exist
   * @param sura - Surah number
   * @param ayah - Ayah number
   */
  remove(sura: number, ayah: number): Promise<void>;

  /**
   * Check if bookmark exists
   * @param sura - Surah number
   * @param ayah - Ayah number
   * @returns Promise resolving to true if bookmark exists
   */
  has(sura: number, ayah: number): Promise<boolean>;
}

/**
 * Bookmarks state machine - explicit state transitions
 */
export type BookmarksState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; bookmarks: Bookmark[] };

/**
 * Bookmark actions (for future use)
 */
export type BookmarkAction =
  | { type: "add"; sura: number; ayah: number; page: number; note?: string }
  | { type: "remove"; sura: number; ayah: number }
  | { type: "toggle"; sura: number; ayah: number };

/**
 * Helper to create bookmark identity
 */
export function createBookmarkIdentity(
  sura: number,
  ayah: number,
): BookmarkIdentity {
  return `${sura}:${ayah}`;
}
