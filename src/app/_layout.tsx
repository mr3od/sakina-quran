// src/app/_layout.tsx

import { WebHeader } from "@/components/layout";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import KVStore from "expo-sqlite/kv-store";
import React, { useEffect, useState } from "react";
import { Platform, View, useColorScheme } from "react-native";
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
      <View className="flex-1 w-full bg-background h-full">
        <WebHeader />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
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
            SurahNames_V4: require("../../assets/fonts/SurahNames_V4.ttf"),
            JuzNames_V2: require("../../assets/fonts/JuzNames_V2.ttf"),
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
      <Head>
        <title>Sakina Quran - Read the Holy Quran Online</title>
        <meta
          name="description"
          content="Read the Holy Quran with beautiful Arabic text. Access all 114 Surahs with verse-by-verse navigation and search functionality."
        />
        <meta
          name="keywords"
          content="Quran, Holy Quran, Islamic, Arabic, Surah, Ayah, Muslim, Islam"
        />
        <meta name="author" content="Sakina Quran" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://quran.mr3od.dev/" />
        <meta
          property="og:title"
          content="Sakina Quran - Read the Holy Quran Online"
        />
        <meta
          property="og:description"
          content="Read the Holy Quran with beautiful Arabic text."
        />
        <meta property="og:image" content="https://quran.mr3od.dev/icon.png" />
        <meta property="og:site_name" content="Sakina Quran" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://quran.mr3od.dev/" />
        <meta
          property="twitter:title"
          content="Sakina Quran - Read the Holy Quran Online"
        />
        <meta
          property="twitter:description"
          content="Read the Holy Quran with beautiful Arabic text."
        />
        <meta
          property="twitter:image"
          content="https://quran.mr3od.dev/icon.png"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://quran.mr3od.dev/" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sakina Quran",
            description: "Read the Holy Quran with beautiful Arabic text",
            url: "https://quran.mr3od.dev",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web, iOS, Android",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Organization",
              name: "Sakina Quran",
            },
          })}
        </script>
      </Head>
      <SafeAreaProvider>
        <QueryProvider>
          <QueryProvider>
            {Platform.OS === "web" ? (
              <RootLayoutContent />
            ) : (
              <SQLiteProvider
                databaseName="quran.db"
                assetSource={{ assetId: require("../../assets/quran.db") }}
                onError={(error) => {
                  console.error("Database initialization error:", error);
                }}
              >
                <RootLayoutContent />
              </SQLiteProvider>
            )}
          </QueryProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
