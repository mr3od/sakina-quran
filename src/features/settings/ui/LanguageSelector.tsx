/**
 * LanguageSelector UI Component
 * Unified language switching with RTL awareness
 */

import { Trans, useLingui } from "@lingui/react/macro";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import type { LanguageId } from "../domain/settings-contract";

const LANGUAGES: { id: LanguageId; nameEn: string; nameAr: string }[] = [
  { id: "en", nameEn: "English", nameAr: "English" },
  { id: "ar", nameEn: "Arabic", nameAr: "العربية" },
];

interface LanguageSelectorProps {
  activeLanguage: LanguageId;
  onSelectLanguage: (id: LanguageId) => void;
}

export function LanguageSelector({
  activeLanguage,
  onSelectLanguage,
}: LanguageSelectorProps) {
  const { i18n } = useLingui();
  const isAr = i18n.locale === "ar";
  const borderColor = useCSSVariable("--color-border-subtle");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row"
      className="flex-1"
    >
      {LANGUAGES.map((lang, index) => {
        const isActive = activeLanguage === lang.id;
        const isLast = index === LANGUAGES.length - 1;

        return (
          <View key={lang.id} className="flex-row items-center">
            <Pressable
              onPress={() => onSelectLanguage(lang.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={isAr ? lang.nameAr : lang.nameEn}
              className={`
                flex-row items-center px-4 py-3 rounded-full
                ${
                  isActive
                    ? "bg-surface-elevated border border-border"
                    : "bg-transparent hover:bg-surface-elevated"
                }
                active:opacity-80
              `}
            >
              <Text
                className={`text-sm ${
                  isActive
                    ? "text-text-primary font-medium"
                    : "text-text-secondary"
                } ${lang.id === "ar" ? "font-ui-ar" : "font-ui-en"}`}
              >
                <Trans>{isAr ? lang.nameAr : lang.nameEn}</Trans>
              </Text>
            </Pressable>

            {/* Separator line (except for last item) */}
            {!isLast && (
              <View
                className="w-px h-6 bg-border-subtle mx-3"
                style={{ backgroundColor: borderColor as string }}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
