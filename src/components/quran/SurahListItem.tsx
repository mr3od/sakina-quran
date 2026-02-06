import { getSurahNameGlyph } from "@/shared/lib/quran-fonts";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Surah } from "../../types/quran.types";

interface SurahListItemProps {
  surah: Surah;
}

export function SurahListItem({ surah }: SurahListItemProps) {
  const { t, i18n } = useLingui();
  const isAr = i18n.locale === "ar";
  const revelationPlaceRaw = surah.revelation_place.toLowerCase();

  // Pick localized revelation text
  const revelationText = revelationPlaceRaw === "makkah" ? t`Makki` : t`Madani`;

  const firstPage = parseInt(surah.pages_range.split("-")[0]);
  return (
    <Link href={`/pages/${firstPage}?surah=${surah.id}`} asChild>
      <Pressable
        className="
          p-4 
          border rounded-xl 
          bg-surface 
          border-border-subtle
          active:bg-surface-elevated active:border-border-base
          hover:bg-surface-elevated
          transition-colors
        "
        style={{ minHeight: 88 }}
        accessibilityRole="button"
        accessibilityLabel={t`Surah ${surah.id}, ${surah.name_simple}, ${revelationText}, ${surah.verses_count} verses`}
        accessibilityHint={t`Double tap to read this Surah`}
      >
        <View className="flex-row items-center gap-4">
          {/* Surah Number Box - At START (Right in AR, Left in EN) */}
          <View
            className="w-11 h-11 rounded-xl bg-surface-elevated border border-border-base items-center justify-center shrink-0"
            accessible
            accessibilityLabel={t`Surah number ${surah.id}`}
          >
            <Text className="text-base font-bold text-text-primary">
              {surah.id}
            </Text>
          </View>

          {/* Main Content Area */}
          <View className="flex-1 min-w-0">
            {isAr ? (
              <Text
                className="font-surah-name text-4xl text-text-primary mb-1"
                numberOfLines={1}
                accessible
                lang="ar"
                style={{
                  writingDirection: "rtl",
                }}
                accessibilityLabel={surah.name_simple}
              >
                {getSurahNameGlyph(surah.id)}
              </Text>
            ) : (
              <Text
                className="font-ui-en text-lg font-bold text-text-primary mb-1"
                numberOfLines={1}
              >
                {surah.name_simple}
              </Text>
            )}

            <View className="flex-col">
              <Text className="text-xs text-text-tertiary mb-0.5">
                <Trans>{revelationText}</Trans>
              </Text>
              <Text className="text-xs text-text-tertiary">
                <Trans>Verses: {surah.verses_count}</Trans>
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
