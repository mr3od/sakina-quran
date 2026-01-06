/**
 * ThemeSelector - Theme Selection Component
 * Clean horizontal button design matching quran.com style with scrolling
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import type { ThemeId } from "../domain/settings-contract";
import { THEMES_ARRAY } from "../domain/theme-metadata";

interface ThemeSelectorProps {
  activeTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export function ThemeSelector({
  activeTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
  const borderColor = useCSSVariable("--color-border-subtle");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row"
      className="flex-1"
    >
      {THEMES_ARRAY.map((theme, index) => {
        const isActive = theme.id === activeTheme;
        const isLast = index === THEMES_ARRAY.length - 1;

        return (
          <View key={theme.id} className="flex-row items-center">
            <Pressable
              onPress={() => onSelectTheme(theme.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={theme.nameEn}
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
              {/* Icon for specific themes */}
              {theme.id === "fajr" && (
                <Ionicons
                  name="sunny-outline"
                  size={16}
                  className={`mr-2 ${
                    isActive ? "text-text-primary" : "text-text-secondary"
                  }`}
                />
              )}
              {theme.id === "layl" && (
                <Ionicons
                  name="moon-outline"
                  size={16}
                  className={`mr-2 ${
                    isActive ? "text-text-primary" : "text-text-secondary"
                  }`}
                />
              )}

              <Text
                className={`font-ui-en text-sm ${
                  isActive
                    ? "text-text-primary font-medium"
                    : "text-text-secondary"
                }`}
              >
                {theme.nameEn}
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
