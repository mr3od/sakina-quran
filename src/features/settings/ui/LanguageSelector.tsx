/**
 * LanguageSelector UI Component
 * Unified language switching with RTL awareness
 */

import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";
import type { LanguageId } from "../domain/settings-contract";

const LANGUAGES: { id: LanguageId; name: string }[] = [
  { id: "en", name: "English" },
  { id: "ar", name: "العربية" },
];

interface LanguageSelectorProps {
  activeLanguage: LanguageId;
  onSelectLanguage: (id: LanguageId) => void;
}

interface LanguageItemProps {
  lang: { id: LanguageId; name: string };
  isActive: boolean;
  isLast: boolean;
  onSelectLanguage: (id: LanguageId) => void;
  borderColor: string;
}

function LanguageItem({
  lang,
  isActive,
  isLast,
  onSelectLanguage,
  borderColor,
}: LanguageItemProps) {
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
            onSelectLanguage(lang.id);
          }}
          onPressIn={() => {
            scale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={lang.name}
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
              isActive ? "text-text-primary font-medium" : "text-text-secondary"
            } ${lang.id === "ar" ? "font-ui-ar" : "font-ui-en"}`}
          >
            {lang.name}
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

export function LanguageSelector({
  activeLanguage,
  onSelectLanguage,
}: LanguageSelectorProps) {
  const borderColor = useCSSVariable("--color-border-subtle");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row"
      className="flex-1"
    >
      {LANGUAGES.map((lang, index) => (
        <LanguageItem
          key={lang.id}
          lang={lang}
          isActive={activeLanguage === lang.id}
          isLast={index === LANGUAGES.length - 1}
          onSelectLanguage={onSelectLanguage}
          borderColor={borderColor as string}
        />
      ))}
    </ScrollView>
  );
}
