/**
 * SearchListItem
 * --------------
 * Unified component to render ALL search result types consistently.
 * All results use the same flat structure with a `type` discriminator.
 *
 * Design: Clean, scannable, with subtle visual cues for different result types.
 
 */

import { useLocaleFont } from "@/hooks/useLocaleFont";
import { escapeRegExp } from "@/shared/lib/text-utils";
import { useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SearchRow, toSurahAyahPath, useLocalizedSearchLabel } from "../app";

export interface SearchListItemProps {
  item: SearchRow;
  searchTerm?: string;
}

/** Render text with highlighted search term */
function renderHighlightedText(text: string, term: string | undefined) {
  const q = (term || "").trim();
  if (!q) return text;

  const rx = new RegExp(`(${escapeRegExp(q)})`, "gi");
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

export function SearchListItem({ item, searchTerm }: SearchListItemProps) {
  const { t } = useLingui();
  const fontClass = useLocaleFont();
  const isAyahResult = item.type === "ayah";
  const displayText = useLocalizedSearchLabel(item);

  return (
    <Link href={toSurahAyahPath(item)} asChild>
      <Pressable
        className="bg-surface border border-border p-4 rounded-xl mb-2 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={
          isAyahResult
            ? t`Verse ${item.sura}:${item.ayah} in ${item.surahName}`
            : t`Navigate to ${item.simple}`
        }
        accessibilityHint={t`Double tap to open`}
      >
        {/* Simple with literal highlight */}
        <View>
          {isAyahResult ? (
            <Text
              className={`font-ui-ar leading-quran text-text-primary mb-2`}
              style={{
                writingDirection: "rtl",
                // for android
                direction: "rtl",
              }}
              accessible
              accessibilityLanguage="ar"
              selectable
            >
              {renderHighlightedText(item.simple, searchTerm)}
            </Text>
          ) : (
            <Text className={`${fontClass} text-text-primary mb-2`} selectable>
              {displayText}
            </Text>
          )}

          {/* Header */}
          <View className="flex-row items-center gap-1">
            <View className="bg-surface-elevated px-2 py-1 rounded-md">
              <Text className={`${fontClass} text-2xs text-text-secondary`}>
                {item.sura}:{item.ayah}
              </Text>
            </View>
            <Text
              className={`${fontClass} text-xs font-semibold text-text-primary`}
            >
              {item.surahName}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
