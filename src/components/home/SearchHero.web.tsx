import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { WebSearchOverlay } from "../search/WebSearchOverlay";

export function SearchHero() {
  const { t } = useLingui();
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
          accessibilityLabel={t`Search the Quran`}
          accessibilityHint={t`Open search overlay`}
        >
          <Ionicons name="search" size={24} color={accentColor as string} />
          <Text className="flex-1 mx-4 text-lg text-text-tertiary">
            <Trans>Search the Quran...</Trans>
          </Text>
          <Text className="text-sm text-text-tertiary">
            <Trans>⌘K</Trans>
          </Text>
        </Pressable>
      )}
    </View>
  );
}
