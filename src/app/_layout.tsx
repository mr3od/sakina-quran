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
import { Platform, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Uniwind } from "uniwind";

import { useLingui } from "@lingui/react/macro";
import { QueryProvider } from "../contexts/QueryProvider";
import "../global.css";

SplashScreen.setOptions({ duration: 2000, fade: true });

const DefaultI18nComponent = ({ children }: TransRenderProps) => {
  const fontClass = useLocaleFont();
  return <Text className={fontClass}>{children}</Text>;
};

function RootLayoutContent() {
  const insets = useSafeAreaInsets();
  const { i18n } = useLingui();
  const segments = useSegments();
  const isReaderPage = segments[0] === "pages";
  const isAr = i18n.locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  return (
    <View
      //@ts-ignore
      dir={Platform.OS === "web" ? dir : undefined}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <SEOHead
        title={t`Sakina Quran - Read the Holy Quran Online`}
        description={t`Read the Holy Quran Online. Access all 114 Surahs with verse-by-verse navigation and search functionality.`}
        keywords={t`Quran, Holy Quran, Islamic, Arabic, Surah, Ayah, Muslim, Islam`}
      />

      <View className="flex-1 w-full bg-background">
        {!isReaderPage && <WebHeader />}

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pages/[number]" />
        </Stack>
      </View>
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

  const content = <RootLayoutContent />;

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <I18nProvider i18n={i18n} defaultComponent={DefaultI18nComponent}>
          <QueryProvider>
            {Platform.OS === "web" ? (
              content
            ) : (
              <SQLiteProvider
                databaseName="quran.db"
                assetSource={{ assetId: require("../../assets/quran.db") }}
              >
                {content}
              </SQLiteProvider>
            )}
          </QueryProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
