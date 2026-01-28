/**
 * ThemeSelector - Theme Selection Component
 * Clean horizontal button design matching quran.com style with scrolling
 */

import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";
import type { ThemeId } from "../domain/settings-contract";
import { THEMES_ARRAY } from "../domain/theme-metadata";

interface ThemeSelectorProps {
  activeTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

interface ThemeItemProps {
  theme: (typeof THEMES_ARRAY)[number];
  isActive: boolean;
  isLast: boolean;
  onSelectTheme: (theme: ThemeId) => void;
  isAr: boolean;
  borderColor: string;
}

function ThemeItem({
  theme,
  isActive,
  isLast,
  onSelectTheme,
  isAr,
  borderColor,
}: ThemeItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-row items-center">
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectTheme(theme.id);
          }}
          onPressIn={() => {
            scale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={isAr ? theme.nameAr : theme.nameEn}
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
            className={`text-sm ${
              isActive ? "text-text-primary font-medium" : "text-text-secondary"
            }`}
          >
            <Trans>{isAr ? theme.nameAr : theme.nameEn}</Trans>
          </Text>
        </Pressable>
      </Animated.View>

      {/* Separator line (except for last item) */}
      {!isLast && (
        <View
          className="w-px h-6 bg-border-subtle mx-3"
          style={{ backgroundColor: borderColor }}
        />
      )}
    </View>
  );
}

export function ThemeSelector({
  activeTheme,
  onSelectTheme,
}: ThemeSelectorProps) {
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
      {THEMES_ARRAY.map((theme, index) => (
        <ThemeItem
          key={theme.id}
          theme={theme}
          isActive={theme.id === activeTheme}
          isLast={index === THEMES_ARRAY.length - 1}
          onSelectTheme={onSelectTheme}
          isAr={isAr}
          borderColor={borderColor as string}
        />
      ))}
    </ScrollView>
  );
}
