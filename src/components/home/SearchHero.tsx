import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { useCSSVariable } from "uniwind";

export function SearchHero() {
  const accentColor = useCSSVariable("--color-accent");

  return (
    <Link
      href="/(tabs)/search"
      asChild
      accessibilityLabel="Search the Quran"
      accessibilityHint="Navigate to search screen"
    >
      <Pressable className="w-full bg-surface border border-border rounded-xl px-6 py-4 flex-row items-center active:bg-surface-elevated shadow-sm">
        <Ionicons name="search" size={24} color={accentColor as string} />
        <Text className="flex-1 mx-4 font-ui-en text-lg text-text-tertiary">
          Search the Quran...
        </Text>
      </Pressable>
    </Link>
  );
}
