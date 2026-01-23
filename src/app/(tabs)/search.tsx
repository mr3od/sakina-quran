/**
 * Search Screen (Uniform Results)
 * -------------------------------
 * - Debounces input (300ms)
 * - Delegates to useSearchController
 * - One FlatList, one item component for ALL kinds
 * - Navigation path: /surah/{id}?ayah={number}
 */

import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
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

import { useLocaleFont } from "@/hooks/useLocaleFont";

export default function SearchScreen() {
  const { t } = useLingui();
  const fontClass = useLocaleFont();
  const params = useLocalSearchParams<{ q: string }>();
  // Initialize with URL param q if it exists
  const [input, setInput] = useState(params.q || "");
  // The actual term used for searching
  const [searchTerm, setSearchTerm] = useState(params.q || "");

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  // Force update on Enter
  function handleSearch() {
    setSearchTerm(input);
  }

  const state = useSearchController(searchTerm);

  // For display in results list
  const query = searchTerm;

  const accentColor = useCSSVariable("--color-accent");

  function clear() {
    setInput("");
  }

  return (
    <View className="flex-1 bg-background">
      <Head>
        <title>{t`Search Quran - Sakina Quran`}</title>
        <meta
          name="description"
          content={t`Search the Holy Quran by words, verses, or references. Find specific Ayahs, Surahs, Juz, or page numbers with instant results.`}
        />
        <meta
          name="keywords"
          content="Quran search, Islamic search, Arabic search, verse finder, Ayah search, Surah search, Juz search"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={t`Search Quran - Sakina Quran`}
        />
        <meta
          property="og:description"
          content={t`Search the Holy Quran by words, verses, or references.`}
        />
        <meta property="og:url" content="https://quran.mr3od.dev/search" />
        <meta property="og:type" content="website" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://quran.mr3od.dev/search" />
      </Head>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-3xl font-bold text-text-primary text-center mb-2">
          <Trans>Search the Quran</Trans>
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 h-11">
          <Ionicons name="search" size={20} color={accentColor as string} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t`e.g., الله — نب — 7 — 7:7 — juz 5 — حزب 7 — page 151`}
            placeholderTextColor="#94A3B8"
            className={`flex-1 mx-3 ${fontClass} text-base text-text-primary h-11`}
            accessibilityLabel={t`Search input`}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            style={{ outline: "none" }}
          />
          {!!input && (
            <Pressable
              onPress={clear}
              className="p-1"
              accessibilityRole="button"
              accessibilityLabel={t`Clear`}
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
            <Text className="text-sm text-text-secondary mt-4">
              <Trans>Searching…</Trans>
            </Text>
          </View>
        )}

        {state.kind === "entry" && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="search-outline" size={64} color="#94A3B8" />
            <Text className="text-base text-text-primary text-center mt-4 mb-2">
              <Trans>Search the Quran</Trans>
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              <Trans>
                Enter words (الله), fragments (نب), or references (7, 7:7, juz
                5, حزب 7, page 151).
              </Trans>
            </Text>
          </View>
        )}

        {state.kind === "error" && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-base text-text-primary text-center mt-4 mb-2">
              <Trans>Search Failed</Trans>
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              {state.message}
            </Text>
          </View>
        )}

        {state.kind === "empty" && query.length > 0 && (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="document-text-outline" size={64} color="#94A3B8" />
            <Text className="text-base text-text-primary text-center mt-4 mb-2">
              <Trans>No Results Found</Trans>
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              <Trans>
                Try a different word or a smaller fragment (e.g., نب).
              </Trans>
            </Text>
          </View>
        )}

        {state.kind === "results" && (
          <FlatList
            data={state.items}
            keyExtractor={(it) => `${it.type}:${it.page}:${it.sura}:${it.ayah}`}
            renderItem={({ item }) => (
              <SearchListItem item={item} searchTerm={query} />
            )}
            showsVerticalScrollIndicator={false}
            accessibilityRole="list"
            accessibilityLabel={t`Search results, ${state.items.length} items`}
          />
        )}
      </View>
    </View>
  );
}
