import { useSetTheme, useSettings } from "@/features/settings/app";
import { ThemeSelector } from "@/features/settings/ui/ThemeSelector";
import { Ionicons } from "@expo/vector-icons";
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
                <Text className="text-xl font-ui-en font-medium text-text-primary">
                  Settings
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

              {/* Theme Section */}
              <View className="p-4">
                <View className="mb-4">
                  <Text className="text-lg font-ui-en font-medium text-text-primary mb-1">
                    Theme
                  </Text>
                  <Text className="text-sm font-ui-en text-text-secondary">
                    Choose your preferred theme
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
