import { WebHeader } from "@/components/layout";
import { useLocaleFont } from "@/hooks/useLocaleFont";
import { bootstrapLocale, i18n } from "@/shared/i18n";
import { SEOHead } from "@/shared/ui/SEOHead";
import { t } from "@lingui/core/macro";
import { I18nProvider, type TransRenderProps } from "@lingui/react";

import * as Font from "expo-font";
import { Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import KVStore from "expo-sqlite/kv-store";

import React, { useEffect, useState } from "react";
import { I18nManager, Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import { useLingui } from "@lingui/react/macro";
import { QueryProvider } from "../contexts/QueryProvider";
import "../global.css";

SplashScreen.setOptions({ duration: 2000, fade: true });

const DefaultI18nComponent = ({ children }: TransRenderProps) => {
  const fontClass = useLocaleFont();
  const isRTL = I18nManager.isRTL;

  return (
    <Text
      className={fontClass}
      // Override default Text to respect app locale, not system locale
      style={{
        writingDirection: isRTL ? "rtl" : "ltr",
      }}
    >
      {children}
    </Text>
  );
};

function RootLayoutContent() {
  const { i18n } = useLingui();
  const segments = useSegments();
  const isReaderPage = segments[0] === "pages";
  const isAr = i18n.locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  if (__DEV__) {
    // Debug RTL state in layout
    console.debug(`[RootLayoutContent] Render - i18n.locale: ${i18n.locale}`);
    console.debug(`[RootLayoutContent] Render - isAr: ${isAr}`);
    console.debug(`[RootLayoutContent] Render - dir: ${dir}`);
    console.debug(
      `[RootLayoutContent] Render - I18nManager.isRTL: ${I18nManager.isRTL}`,
    );
    console.debug(`[RootLayoutContent] Render - Platform.OS: ${Platform.OS}`);
  }

  return (
    <View
      //@ts-ignore
      dir={Platform.OS === "web" ? dir : undefined}
      className="flex-1 bg-background p-safe"
    >
      <SEOHead
        title={t`Sakina Quran - Read the Holy Quran Online`}
        description={t`Read the Holy Quran Online. Access all 114 Surahs with verse-by-verse navigation and search functionality.`}
        keywords={t`Quran, Holy Quran, Islamic, Arabic, Surah, Ayah, Muslim, Islam`}
      />

      {!isReaderPage && <WebHeader />}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pages/[number]" />
      </Stack>
    </View>
  );
}

async function initApp() {
  await bootstrapLocale();

  const theme = (await KVStore.getItem("theme")) || "fajr";
  Uniwind.setTheme(theme as any);
  if (!(await KVStore.getItem("theme"))) await KVStore.setItem("theme", theme);

  await Font.loadAsync({
    UthmanicHafs_V22: require("../../assets/fonts/UthmanicHafs_V22.ttf"),
    SurahNames_V4: require("../../assets/fonts/SurahNames_V4.ttf"),
    JuzNames_V2: require("../../assets/fonts/JuzNames_V2.ttf"),
    NotoSansArabic_400Regular: require("../../assets/fonts/NotoSansArabic_400Regular.ttf"),
    Inter_400Regular: require("../../assets/fonts/Inter_400Regular.ttf"),
  });
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initApp()
      .catch((e) => console.warn("Init error:", e))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <I18nProvider i18n={i18n} defaultComponent={DefaultI18nComponent}>
          <QueryProvider>
            {Platform.OS === "web" ? (
              <RootLayoutContent />
            ) : (
              <SQLiteProvider
                databaseName="quran.db"
                assetSource={{ assetId: require("../../assets/quran.db") }}
              >
                <RootLayoutContent />
              </SQLiteProvider>
            )}
          </QueryProvider>
        </I18nProvider>
      </SafeAreaListener>
    </GestureHandlerRootView>
  );
}
