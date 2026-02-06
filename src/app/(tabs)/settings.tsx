/**
 * Settings Screen - Thin UI Layer
 * Manages app preferences (theme, language)
 */

import {
  LanguageSelector,
  ThemeSelector,
  useSetLanguage,
  useSetTheme,
  useSettings,
} from "@/features/settings/app";
import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import Head from "expo-router/head";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export default function SettingsScreen() {
  const { data: settings, isLoading, error } = useSettings();
  const setTheme = useSetTheme();
  const setLanguage = useSetLanguage();
  const { t } = useLingui();
  const accentColor = useCSSVariable("--color-accent");

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={accentColor as string} />
        <Text className="text-text-secondary mt-4">
          <Trans>Loading settings...</Trans>
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
        <Text className="text-text-primary text-center mb-2">
          <Trans>Failed to load settings</Trans>
        </Text>
        <Text className="text-text-secondary text-center text-sm">
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
      <Head>
        <title>{t`Settings - Sakina Quran`}</title>
        <meta
          name="description"
          content={t`Customize your Quran reading experience. Change themes, adjust font sizes, and configure app preferences.`}
        />
        <meta
          name="keywords"
          content={t`Quran settings, app preferences, theme selection, customization`}
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={t`Settings - Sakina Quran`}
        />
        <meta
          property="og:description"
          content={t`Customize your Quran reading experience.`}
        />
        <meta property="og:url" content="https://quran.mr3od.dev/settings" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://quran.mr3od.dev/settings" />
      </Head>
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl text-text-primary mb-2">
            <Trans>Settings</Trans>
          </Text>
        </View>

        {/* Language Section */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-xl text-text-primary mb-1">
              <Trans>Language</Trans>
            </Text>
          </View>
          <LanguageSelector
            activeLanguage={settings.language}
            onSelectLanguage={(lang) => setLanguage.mutate(lang)}
          />
        </View>

        {/* Theme Section */}
        <View className="mb-6">
          <View className="mb-4">
            <Text className="text-xl text-text-primary mb-1">
              <Trans>Theme</Trans>
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
            <Text className="text-xl text-text-primary mb-1">
              <Trans>App Information</Trans>
            </Text>
          </View>

          <View className="bg-surface p-4 rounded-xl border border-border gap-3">
            {/* Version */}
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-text-secondary">
                <Trans>Version</Trans>
              </Text>
              <Text className="text-base text-text-primary">1.0.0</Text>
            </View>

            {/* Credits */}
            <View className="border-t border-border pt-3">
              <Text className="text-sm text-text-tertiary mb-2">
                <Trans>Credits</Trans>
              </Text>
              <Text className="text-sm text-text-secondary leading-relaxed">
                <Trans>Quran text from Tanzil.net</Trans>
                {"\n"}
                <Trans>Uthmanic Hafs font by KFGQPC</Trans>
                {"\n"}
                <Trans>Built with Expo & React Native</Trans>
              </Text>
            </View>

            {/* License */}
            <View className="border-t border-border pt-3">
              <Text className="text-sm text-text-tertiary mb-2">
                <Trans>License</Trans>
              </Text>
              <Text className="text-sm text-text-secondary">
                <Trans>Open source under MIT License</Trans>
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
