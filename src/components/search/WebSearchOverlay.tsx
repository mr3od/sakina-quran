import { useLocaleFont } from "@/hooks/useLocaleFont";
import { Ionicons } from "@expo/vector-icons";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";

import type { SearchRow } from "@/features/search/app";
import {
  toSurahAyahPath,
  useLocalizedSearchLabel,
  useSearchController,
} from "@/features/search/app";
import { escapeRegExp } from "@/shared/lib/text-utils";

interface WebSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function makeHighlightRx(term: string) {
  const q = term.trim();
  if (!q) return null;
  return new RegExp(`(${escapeRegExp(q)})`, "gi");
}

function renderHighlightedText(text: string, rx: RegExp | null) {
  if (!rx) return text;
  const parts = text.split(rx);

  return (
    <>
      {parts.map((seg, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            className="bg-highlight text-text-primary font-semibold"
          >
            {seg}
          </Text>
        ) : (
          <Text key={i}>{seg}</Text>
        ),
      )}
    </>
  );
}

function WebSearchResultItem({
  item,
  highlightRx,
  onSelect,
  isSelected,
}: {
  item: SearchRow;
  highlightRx: RegExp | null;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const { t } = useLingui();
  const fontClass = useLocaleFont();
  const isAyahResult = item.type === "ayah";
  const displayText = useLocalizedSearchLabel(item);

  return (
    <Link href={toSurahAyahPath(item)} asChild>
      <Pressable
        className={`px-4 py-3 flex-row items-center hover:bg-surface-elevated transition-colors ${
          isSelected ? "bg-surface-elevated" : ""
        }`}
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityLabel={
          isAyahResult
            ? t`Verse ${item.sura}:${item.ayah} in ${item.surahName}`
            : t`Navigate to ${displayText}`
        }
      >
        <Ionicons
          name={isAyahResult ? "book-outline" : "bookmark-outline"}
          size={16}
          color="#94A3B8"
          className="mx-3"
        />

        <View className="flex-1">
          <Text
            className={`${fontClass} text-base text-text-primary mb-1 leading-relaxed`}
            accessibilityLanguage="ar"
          >
            {renderHighlightedText(displayText, highlightRx)}
          </Text>

          <View className="flex-row items-center">
            <View className="bg-surface px-2 py-0.5 rounded mr-2">
              <Text className={`${fontClass} text-xs text-text-secondary`}>
                {item.sura}:{item.ayah}
              </Text>
            </View>
            <Text className={`${fontClass} text-xs text-text-secondary`}>
              {item.surahName}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export function WebSearchOverlay({ isOpen, onClose }: WebSearchOverlayProps) {
  const { t, i18n } = useLingui();
  const fontClass = useLocaleFont();
  const [input, setInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const overlayRef = useRef<View>(null);

  // Track whether user explicitly moved selection with arrow keys.
  // If false: Enter should go to /search?q=...
  const selectionIntentRef = useRef(false);

  const accentColor = useCSSVariable("--color-accent");

  const state = useSearchController(input);
  const highlightRx = makeHighlightRx(input);

  const query = input.trim();
  const results = state.kind === "results" ? state.items : [];
  const resultsLength = results.length;

  const defaultSuggestions = [
    { label: msg`Juz 1`, query: "juz 1" },
    { label: msg`Page 1`, query: "page 1" },
    { label: msg`Surah Ya-Sin`, query: "36:1" },
    { label: msg`Ayat al-Kursi`, query: "2:255" },
  ];

  const goToSearchPage = () => {
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  // Open: reset + focus
  useEffect(() => {
    if (!isOpen) return;

    setInput("");
    setSelectedIndex(0);
    selectionIntentRef.current = false;

    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  // On input change: reset selection intent + selection index
  useEffect(() => {
    if (!isOpen) return;
    selectionIntentRef.current = false;
    setSelectedIndex(0);
  }, [input, isOpen]);

  // Clamp when results length changes
  useEffect(() => {
    if (state.kind !== "results") return;
    setSelectedIndex((i) => Math.min(i, Math.min(resultsLength - 1, 4)));
  }, [state.kind, resultsLength]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      const overlayEl = overlayRef.current as unknown as {
        contains?: (n: any) => boolean;
      } | null;

      if (!overlayEl) return;

      const path = (event as any).composedPath?.() as unknown[] | undefined;
      const clickedInside =
        (path && path.includes(overlayEl)) ||
        (!!overlayEl.contains && overlayEl.contains(event.target));

      if (!clickedInside) onClose();
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen, onClose]);

  const handleKey = (e: any) => {
    if (!isOpen) return;

    const key = e?.nativeEvent?.key ?? e?.key;

    if (key === "Escape") {
      e.preventDefault?.();
      onClose();
      return;
    }

    // ENTER: default to search page unless user explicitly used arrows
    if (key === "Enter") {
      e.preventDefault?.();

      if (
        selectionIntentRef.current &&
        state.kind === "results" &&
        results[selectedIndex]
      ) {
        const item = results[selectedIndex];
        router.push(`/pages/${item.page}?surah=${item.sura}&ayah=${item.ayah}`);
        onClose();
        return;
      }

      goToSearchPage();
      return;
    }

    // Arrow navigation only when results exist
    if (state.kind !== "results" || resultsLength === 0) return;

    const maxIndex = Math.min(resultsLength - 1, 4);

    switch (key) {
      case "ArrowDown":
        e.preventDefault?.();
        selectionIntentRef.current = true;
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case "ArrowUp":
        e.preventDefault?.();
        selectionIntentRef.current = true;
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
    }
  };

  // IMPORTANT: keep dropdown mounted while open → prevents flicker
  const showDropdown = isOpen;

  const showSuggestions = query.length === 0;
  const showLoading = query.length > 0 && state.kind === "loading";

  const showEmpty = query.length > 0 && state.kind === "empty";
  const showResults = query.length > 0 && state.kind === "results";

  if (!isOpen) return null;

  return (
    <View ref={overlayRef} className="relative w-full">
      {/* Input */}
      <View className="flex-row items-center bg-surface border border-border rounded-xl px-6 py-4 shadow-sm">
        <Ionicons name="search" size={24} color={accentColor as string} />
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          placeholder={t`Search the Quran...`}
          placeholderTextColor="#94A3B8"
          className={`flex-1 mx-4 ${fontClass} text-lg text-text-primary outline-none`}
          accessibilityLabel={t`Search input`}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onKeyPress={handleKey}
          // @ts-expect-error web-only prop: react-native-web TextInput handles key events
          onKeyDown={handleKey}
        />
        {input.length > 0 ? (
          <Pressable
            onPress={() => setInput("")}
            className="p-1"
            accessibilityLabel={t`Clear search`}
          >
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </Pressable>
        ) : (
          <Text className="text-sm text-text-tertiary">
            <Trans>⌘K</Trans>
          </Text>
        )}
      </View>

      {/* Dropdown (always mounted while open to prevent flicker) */}
      {showDropdown && (
        <View
          className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border overflow-hidden"
          style={{ zIndex: 1000, maxHeight: 360 }}
        >
          {/* Suggestions */}
          {showSuggestions && (
            <View>
              <Text className="px-4 py-2 text-xs text-text-secondary uppercase tracking-wide">
                <Trans>Try searching for</Trans>
              </Text>
              {defaultSuggestions.map((s) => (
                <Pressable
                  key={s.query}
                  className="px-4 py-3 flex-row items-center hover:bg-surface-elevated transition-colors"
                  onPress={() => setInput(s.query)}
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={16}
                    color="#94A3B8"
                    className="mx-3"
                  />
                  <Text className={`${fontClass} text-sm text-text-primary`}>
                    {i18n._(s.label)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Loading */}
          {showLoading && (
            <View className="px-4 py-6 items-center">
              <ActivityIndicator size="small" color={accentColor as string} />
              <Text className="text-sm text-text-secondary mt-2">
                <Trans>Searching...</Trans>
              </Text>
            </View>
          )}

          {/* Empty */}
          {showEmpty && (
            <View className="px-4 py-6 items-center">
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#94A3B8"
              />
              <Text className="text-sm text-text-secondary mt-2">
                <Trans>No results found</Trans>
              </Text>
            </View>
          )}

          {showResults && (
            <View style={{ flexShrink: 1 }}>
              <FlatList
                data={results.slice(0, 5)}
                keyExtractor={(item) =>
                  `${item.type}:${item.page}:${item.sura}:${item.ayah}`
                }
                renderItem={({ item, index }) => (
                  <WebSearchResultItem
                    item={item}
                    highlightRx={highlightRx}
                    onSelect={onClose}
                    isSelected={index === selectedIndex}
                  />
                )}
                scrollEnabled
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 280 }} // 👈 leaves room for footer within maxHeight 360
              />

              {/* Always visible footer */}
              <Pressable
                className="px-4 py-3 border-t border-border flex-row items-center justify-center hover:bg-surface-elevated transition-colors"
                onPress={goToSearchPage}
                accessibilityRole="button"
                accessibilityLabel={t`View all results for ${query}`}
              >
                <Text className="text-sm text-accent font-medium">
                  <Trans>View all results</Trans>
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={accentColor as string}
                  className="ml-2"
                />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
