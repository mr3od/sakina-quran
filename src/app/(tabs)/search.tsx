/**
 * Search Screen (Uniform Results)
 * -------------------------------
 * - Debounces input (300ms)
 * - Delegates to useSearchController
 * - One FlatList, one item component for ALL kinds
 * - Navigation path: /surah/{id}?ayah={number}
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";

import { useSearchController } from "@/features/search/app";
import { SearchListItem } from "@/features/search/ui/SearchListItem";
/** Simple debounce hook; no callbacks, no memoization. */
function useDebouncedValue(value: string, delayMs = 300): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export default function SearchScreen() {
  const [input, setInput] = useState("");
  const query = useDebouncedValue(input, 300);
  const state = useSearchController(query);

  const accentColor = useCSSVariable("--color-accent");

  function clear() {
    setInput("");
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="font-ui-ar text-3xl font-bold text-text-primary text-center mb-2">
          البحث في القرآن
        </Text>
        <Text className="font-ui-en text-sm text-text-secondary text-center">
          Search the Quran
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 h-11">
          <Ionicons name="search" size={20} color={accentColor as string} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="e.g., الله — نب — 7 — 7:7 — juz 5 — حزب 7 — page 151"
            placeholderTextColor="#94A3B8"
            className="flex-1 mx-3 font-ui-en text-base text-text-primary h-11"
            accessibilityLabel="Search input"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {!!input && (
            <Pressable
              onPress={clear}
              className="p-1"
              accessibilityRole="button"
              accessibilityLabel="Clear"
            >
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Body */}
      <View className="flex-1 px-4">
        {state.kind === "loading" && query.length > 0 && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={accentColor as string} />
            <Text className="font-ui-en text-sm text-text-secondary mt-4">
              Searching…
            </Text>
          </View>
        )}

        {state.kind === "entry" && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="search-outline" size={64} color="#94A3B8" />
            <Text className="font-ui-en text-base text-text-primary text-center mt-4 mb-2">
              Search the Quran
            </Text>
            <Text className="font-ui-en text-sm text-text-secondary text-center">
              Enter words (الله), fragments (نب), or references (7, 7:7, juz 5,
              حزب 7, page 151).
            </Text>
          </View>
        )}

        {state.kind === "error" && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="font-ui-en text-base text-text-primary text-center mt-4 mb-2">
              Search Failed
            </Text>
            <Text className="font-ui-en text-sm text-text-secondary text-center">
              {state.message}
            </Text>
          </View>
        )}

        {state.kind === "empty" && query.length > 0 && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="document-text-outline" size={64} color="#94A3B8" />
            <Text className="font-ui-en text-base text-text-primary text-center mt-4 mb-2">
              No Results Found
            </Text>
            <Text className="font-ui-en text-sm text-text-secondary text-center">
              Try a different word or a smaller fragment (e.g., نب).
            </Text>
          </View>
        )}

        {state.kind === "results" && (
          <FlatList
            data={state.items}
            keyExtractor={(it) => `${it.type}:${it.sura}:${it.ayah}`}
            renderItem={({ item }) => (
              <SearchListItem item={item} searchTerm={query} />
            )}
            showsVerticalScrollIndicator={false}
            accessibilityRole="list"
            accessibilityLabel={`Search results, ${state.items.length} items`}
          />
        )}
      </View>
    </View>
  );
}
