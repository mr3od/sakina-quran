/**
 * Settings Screen - Thin UI Layer
 * Manages app preferences (theme, font size)
 */

import {
  ThemeSelector,
  useSetTheme,
  useSettings,
} from "@/features/settings/app";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export default function SettingsScreen() {
  const { data: settings, isLoading, error } = useSettings();
  const setTheme = useSetTheme();
  const accentColor = useCSSVariable("--color-accent");

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={accentColor as string} />
        <Text className="text-text-secondary font-ui-en mt-4">
          Loading settings...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-4">
        <Ionicons
          name="alert-circle"
          size={48}
          className="text-text-tertiary mb-4"
        />
        <Text className="text-text-primary font-ui-en text-center mb-2">
          Failed to load settings
        </Text>
        <Text className="text-text-secondary font-ui-en text-center text-sm">
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </View>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-ui-ar text-text-primary mb-2">
            الإعدادات
          </Text>
          <Text className="text-lg font-ui-en text-text-secondary">
            Settings
          </Text>
        </View>

        {/* Theme Section */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-xl font-ui-ar text-text-primary mb-1">
              المظهر
            </Text>
            <Text className="text-base font-ui-en text-text-secondary">
              Theme
            </Text>
          </View>
          <ThemeSelector
            activeTheme={settings.theme}
            onSelectTheme={(theme) => setTheme.mutate(theme)}
          />
        </View>

        {/* App Information Section */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-xl font-ui-ar text-text-primary mb-1">
              معلومات التطبيق
            </Text>
            <Text className="text-base font-ui-en text-text-secondary">
              App Information
            </Text>
          </View>

          <View className="bg-surface p-4 rounded-xl border border-border gap-3">
            {/* Version */}
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-ui-en text-text-secondary">
                Version
              </Text>
              <Text className="text-base font-ui-en text-text-primary">
                1.0.0
              </Text>
            </View>

            {/* Credits */}
            <View className="border-t border-border pt-3">
              <Text className="text-sm font-ui-en text-text-tertiary mb-2">
                Credits
              </Text>
              <Text className="text-sm font-ui-en text-text-secondary leading-relaxed">
                Quran text from Tanzil.net{"\n"}
                Uthmanic Hafs font by KFGQPC{"\n"}
                Built with Expo & React Native
              </Text>
            </View>

            {/* License */}
            <View className="border-t border-border pt-3">
              <Text className="text-sm font-ui-en text-text-tertiary mb-2">
                License
              </Text>
              <Text className="text-sm font-ui-en text-text-secondary">
                Open source under MIT License
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </View>
    </ScrollView>
  );
}
