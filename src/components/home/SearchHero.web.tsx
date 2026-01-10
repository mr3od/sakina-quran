import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { WebSearchOverlay } from "../search/WebSearchOverlay";

export function SearchHero() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const accentColor = useCSSVariable("--color-accent");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isCmdK = (e.metaKey || e.ctrlKey) && isK;

      if (isCmdK) {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <View className="w-full relative z-10">
      {isSearchOpen ? (
        <WebSearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      ) : (
        <Pressable
          className="w-full bg-surface border border-border rounded-xl px-6 py-4 flex-row items-center active:bg-surface-elevated shadow-sm hover:bg-surface-elevated transition-colors"
          onPress={() => setIsSearchOpen(true)}
          accessibilityLabel="Search the Quran"
          accessibilityHint="Open search overlay"
        >
          <Ionicons name="search" size={24} color={accentColor as string} />
          <Text className="flex-1 mx-4 font-ui-en text-lg text-text-tertiary">
            Search the Quran...
          </Text>
          <Text className="font-ui-en text-sm text-text-tertiary">⌘K</Text>
        </Pressable>
      )}
    </View>
  );
}
