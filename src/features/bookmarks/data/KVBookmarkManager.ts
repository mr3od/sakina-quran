/**
 * Data Layer - KV Store Implementation
 * Implements BookmarkManager interface using expo-sqlite/kv-store
 */

import KVStore from "expo-sqlite/kv-store";
import {
  Bookmark,
  BookmarkManager,
  createBookmarkIdentity,
} from "../domain/bookmark-contract";

const BOOKMARKS_KEY = "bookmarks_v2";

/**
 * Consistent sort comparator: DESC timestamp, ASC sura, ASC ayah
 * Prevents flicker when timestamps are equal
 */
const sortBookmarks = (a: Bookmark, b: Bookmark): number =>
  b.timestamp - a.timestamp || a.sura - b.sura || a.ayah - b.ayah;

/**
 * KVBookmarkManager - Persists bookmarks in KV Store as JSON array
 * React Query handles mutation concurrency at the application layer
 */
export class KVBookmarkManager implements BookmarkManager {
  /**
   * Get all bookmarks sorted by timestamp DESC, then sura/ayah ASC
   * Fails soft: returns empty array on parse error
   */
  async getAll(): Promise<Bookmark[]> {
    try {
      const raw = (await KVStore.getItem(BOOKMARKS_KEY)) ?? "[]";
      const bookmarks = JSON.parse(raw) as Bookmark[];
      // Return valid bookmarks
      return bookmarks.sort(sortBookmarks);
    } catch (error) {
      console.error("Bookmarks parse error:", error);
      // TODO: Surface recoverable error once per session
      return [];
    }
  }

  /**
   * Add bookmark (idempotent)
   * If exists, updates note and timestamp
   * React Query handles mutation concurrency
   */
  async add(
    sura: number,
    ayah: number,
    page: number,
    note?: string,
  ): Promise<void> {
    const raw = (await KVStore.getItem(BOOKMARKS_KEY)) ?? "[]";
    let bookmarks: Bookmark[] = [];
    try {
      bookmarks = JSON.parse(raw) as Bookmark[];
    } catch (error) {
      console.error("Parse error in add, starting fresh:", error);
    }

    const now = Date.now();
    const identity = createBookmarkIdentity(sura, ayah);
    const existingIndex = bookmarks.findIndex(
      (b) => createBookmarkIdentity(b.sura, b.ayah) === identity,
    );

    if (existingIndex >= 0) {
      // Update existing bookmark
      bookmarks[existingIndex] = {
        ...bookmarks[existingIndex],
        page, // Ensure page is updated/migrated if it was missing
        note,
        timestamp: now,
      };
    } else {
      // Add new bookmark
      bookmarks.push({ sura, ayah, page, note, timestamp: now });
    }

    // Sort with consistent comparator
    bookmarks.sort(sortBookmarks);

    await KVStore.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }

  /**
   * Remove bookmark (idempotent)
   * No error if bookmark doesn't exist
   * React Query handles mutation concurrency
   */
  async remove(sura: number, ayah: number): Promise<void> {
    const raw = (await KVStore.getItem(BOOKMARKS_KEY)) ?? "[]";
    let bookmarks: Bookmark[] = [];
    try {
      bookmarks = JSON.parse(raw) as Bookmark[];
    } catch (error) {
      console.error("Parse error in remove, starting fresh:", error);
    }

    const identity = createBookmarkIdentity(sura, ayah);
    const filtered = bookmarks.filter(
      (b) => createBookmarkIdentity(b.sura, b.ayah) !== identity,
    );

    await KVStore.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
  }

  /**
   * Check if bookmark exists
   * Fails soft: returns false on error
   */
  async has(sura: number, ayah: number): Promise<boolean> {
    try {
      const bookmarks = await this.getAll();
      const identity = createBookmarkIdentity(sura, ayah);
      return bookmarks.some(
        (b) => createBookmarkIdentity(b.sura, b.ayah) === identity,
      );
    } catch (error) {
      console.error("Failed to check bookmark:", error);
      return false; // Fail soft
    }
  }
}
