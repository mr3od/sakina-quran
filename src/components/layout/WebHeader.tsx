import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { SettingsDrawer } from "./SettingsDrawer";

export function WebHeader() {
  const { t } = useLingui();
  const textColor = useCSSVariable("--color-text-primary");
  const borderColor = useCSSVariable("--color-border-subtle");

  // Only render on web
  if (Platform.OS !== "web") return null;

  return (
    <View
      className="h-16 border-b flex-row items-center px-4 sm:px-8 bg-background"
      style={{ borderBottomColor: borderColor as string }}
    >
      {/* Logo / Home Link */}
      <Link href="/" asChild>
        <Pressable className="flex-row items-center">
          <Text className="text-xl font-medium text-text-primary">
            <Trans>Sakina Quran</Trans>
          </Text>
        </Pressable>
      </Link>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Right side utilities */}
      <View className="flex-row items-center gap-2">
        {/* Bookmarks */}
        <Link href="/(tabs)/bookmarks" asChild>
          <Pressable className="p-2 rounded-lg hover:bg-surface-elevated">
            <Ionicons
              name="bookmark-outline"
              size={20}
              color={textColor as string}
            />
          </Pressable>
        </Link>

        {/* Settings Drawer */}
        <SettingsDrawer />
      </View>
    </View>
  );
}
