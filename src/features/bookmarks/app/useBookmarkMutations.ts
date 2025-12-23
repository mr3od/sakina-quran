/**
 * Application Layer - Bookmark Mutations
 * Implements optimistic updates with rollback guarantees
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KVBookmarkManager } from "../data/KVBookmarkManager";
import { Bookmark, createBookmarkIdentity } from "../domain/bookmark-contract";

interface AddBookmarkParams {
  sura: number;
  ayah: number;
  page: number;
  note?: string;
}

interface RemoveBookmarkParams {
  sura: number;
  ayah: number;
}

interface ToggleBookmarkParams {
  sura: number;
  ayah: number;
  page: number;
  isBookmarked: boolean;
}

/**
 * Consistent sort comparator matching data layer
 */
const sortBookmarks = (a: Bookmark, b: Bookmark): number =>
  b.timestamp - a.timestamp || a.sura - b.sura || a.ayah - b.ayah;

/**
 * useAddBookmark - Add bookmark with optimistic update
 * Handles deduplication and maintains sort order
 */
export function useAddBookmark() {
  const queryClient = useQueryClient();
  const manager = new KVBookmarkManager();

  return useMutation({
    mutationFn: ({ sura, ayah, page, note }: AddBookmarkParams) =>
      manager.add(sura, ayah, page, note),

    onMutate: async ({ sura, ayah, page, note }: AddBookmarkParams) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      const previous =
        queryClient.getQueryData<Bookmark[]>(["bookmarks"]) ?? [];
      const now = Date.now();
      const identity = createBookmarkIdentity(sura, ayah);
      const exists = previous.some(
        (b) => createBookmarkIdentity(b.sura, b.ayah) === identity,
      );

      const next = exists
        ? previous.map((b) =>
            createBookmarkIdentity(b.sura, b.ayah) === identity
              ? { ...b, note, timestamp: now }
              : b,
          )
        : [{ sura, ayah, page, note, timestamp: now }, ...previous];

      queryClient.setQueryData<Bookmark[]>(
        ["bookmarks"],
        next.sort(sortBookmarks),
      );
      queryClient.setQueryData(["bookmark-status", sura, ayah], true);

      return { previous };
    },

    onError: (_error, { sura, ayah }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }

      const wasBookmarked =
        context?.previous?.some((b) => b.sura === sura && b.ayah === ayah) ??
        false;
      queryClient.setQueryData(["bookmark-status", sura, ayah], wasBookmarked);
    },

    onSettled: (_data, _error, { sura, ayah }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({
        queryKey: ["bookmark-status", sura, ayah],
      });
    },
  });
}

/**
 * useRemoveBookmark - Remove bookmark with optimistic update
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();
  const manager = new KVBookmarkManager();

  return useMutation({
    mutationFn: ({ sura, ayah }: RemoveBookmarkParams) =>
      manager.remove(sura, ayah),

    onMutate: async ({ sura, ayah }: RemoveBookmarkParams) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

      const previous =
        queryClient.getQueryData<Bookmark[]>(["bookmarks"]) ?? [];
      const identity = createBookmarkIdentity(sura, ayah);

      queryClient.setQueryData<Bookmark[]>(
        ["bookmarks"],
        previous.filter(
          (b) => createBookmarkIdentity(b.sura, b.ayah) !== identity,
        ),
      );

      queryClient.setQueryData(["bookmark-status", sura, ayah], false);

      return { previous };
    },

    onError: (_error, { sura, ayah }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }

      const wasBookmarked =
        context?.previous?.some((b) => b.sura === sura && b.ayah === ayah) ??
        false;
      queryClient.setQueryData(["bookmark-status", sura, ayah], wasBookmarked);
    },

    onSettled: (_data, _error, { sura, ayah }) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({
        queryKey: ["bookmark-status", sura, ayah],
      });
    },
  });
}

/**
 * useToggleBookmark - Toggle bookmark (delegates to add/remove)
 */
export function useToggleBookmark() {
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  return useMutation({
    mutationFn: async (params: ToggleBookmarkParams) => {
      const { sura, ayah, isBookmarked } = params;
      if (isBookmarked) {
        await removeBookmark.mutateAsync({ sura, ayah });
      } else {
        await addBookmark.mutateAsync({ sura, ayah, page: params.page });
      }
    },
  });
}
