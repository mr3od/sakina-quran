// src/app/_layout.tsx

import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import KVStore from "expo-sqlite/kv-store";
import React, { useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { QueryProvider } from "../contexts/QueryProvider";
import "../global.css";

SplashScreen.setOptions({ duration: 2000, fade: true });

function RootLayoutContent() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          // Task 1: Load and set theme
          (async () => {
            const savedTheme = await KVStore.getItem("theme");

            if (savedTheme) {
              // User has a saved preference
              //@ts-ignore
              Uniwind.setTheme(savedTheme);
            } else {
              // First time - use system preference

              Uniwind.setTheme("fajr");
              // Save the initial choice
              await KVStore.setItem("theme", "fajr");
            }
          })(),

          // Task 2: Load all required fonts
          Font.loadAsync({
            // Quranic Script Font
            UthmanicHafs_V22: require("../../assets/fonts/UthmanicHafs_V22.ttf"),
            // Arabic UI Font
            NotoSansArabic_400Regular: require("../../assets/fonts/NotoSansArabic_400Regular.ttf"),
            // English UI Font
            Inter_400Regular: require("../../assets/fonts/Inter_400Regular.ttf"),
          }),
        ]);
      } catch (e) {
        console.warn("Initialization error:", e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [systemColorScheme]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <QueryProvider>
          <SQLiteProvider
            databaseName="quran.db"
            assetSource={{ assetId: require("../../assets/quran.db") }}
            onError={(error) => {
              console.error("Database initialization error:", error);
            }}
          >
            <RootLayoutContent />
          </SQLiteProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
