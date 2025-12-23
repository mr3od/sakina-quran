/**
 * ThemeSelector - Theme Selection Component
 * Displays all available themes with preview and selection
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 px-1"
      className="flex-row"
    >
      {THEMES_ARRAY.map((theme) => {
        const isActive = theme.id === activeTheme;

        return (
          <Pressable
            key={theme.id}
            onPress={() => onSelectTheme(theme.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${theme.nameAr} (${theme.nameEn})`}
            className={`
              items-center justify-center p-4 rounded-xl border-2
              ${
                isActive
                  ? "border-accent bg-surface-elevated"
                  : "border-border bg-surface"
              }
              active:opacity-80
            `}
            style={{
              minWidth: 100,
            }}
          >
            <Ionicons
              name={theme.icon as any}
              size={28}
              className={`mb-2 ${isActive ? "text-accent" : "text-text-tertiary"}`}
            />
            <Text
              className={`font-ui-ar text-base mb-0.5 ${
                isActive
                  ? "text-text-primary font-medium"
                  : "text-text-secondary"
              }`}
            >
              {theme.nameAr}
            </Text>
            <Text
              className={`font-ui-en text-xs ${
                isActive ? "text-text-secondary" : "text-text-tertiary"
              }`}
            >
              {theme.nameEn}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
