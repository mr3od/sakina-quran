import {
    LanguageSelector,
    ThemeSelector,
    useSetLanguage,
    useSetTheme,
    useSettings,
} from "@/features/settings/app";
import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useCSSVariable } from "uniwind";

export function SettingsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useSettings();
  const setTheme = useSetTheme();
  const setLanguage = useSetLanguage();
  const { t } = useLingui();
  const textColor = useCSSVariable("--color-text-primary");

  // Only render on web
  if (Platform.OS !== "web") return null;

  // Don't render until settings are loaded
  if (!settings) return null;

  return (
    <>
      {/* Settings Icon Trigger */}
      <Pressable
        className="p-2 rounded-lg hover:bg-surface-elevated"
        onPress={() => setIsOpen(true)}
      >
        <Ionicons
          name="settings-outline"
          size={20}
          color={textColor as string}
        />
      </Pressable>

      {/* Settings Drawer Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* Backdrop */}
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          {/* Drawer Content */}
          <View className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border-subtle">
            <ScrollView className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between p-4 border-b border-border-subtle">
                <Text className="text-xl font-medium text-text-primary">
                  <Trans>Settings</Trans>
                </Text>
                <Pressable
                  className="p-1 rounded-lg hover:bg-surface-elevated"
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={textColor as string}
                  />
                </Pressable>
              </View>

              {/* Language Section */}
              <View className="p-4 border-b border-border-subtle">
                <View className="mb-4">
                  <Text className="text-lg font-medium text-text-primary mb-1">
                    <Trans>Language</Trans>
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    <Trans>Choose your preferred language</Trans>
                  </Text>
                </View>
                <LanguageSelector
                  activeLanguage={settings.language}
                  onSelectLanguage={(lang) => setLanguage.mutate(lang)}
                />
              </View>

              {/* Theme Section */}
              <View className="p-4">
                <View className="mb-4">
                  <Text className="text-lg font-medium text-text-primary mb-1">
                    <Trans>Theme</Trans>
                  </Text>
                  <Text className="text-sm text-text-secondary">
                    <Trans>Choose your preferred theme</Trans>
                  </Text>
                </View>
                <ThemeSelector
                  activeTheme={settings.theme}
                  onSelectTheme={(theme) => setTheme.mutate(theme)}
                />
              </View>

              {/* Additional settings sections can go here */}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
