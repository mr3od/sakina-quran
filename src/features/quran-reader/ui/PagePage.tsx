import { AyahCard } from "@/components/quran/AyahCard";
import { BASMALAH, BISMALAH_EXCEPTIONS } from "@/shared/constants/quran";
import {
  getJuzBadgeGlyph,
  getSurahNameGlyph,
  getSurahNameHeader,
} from "@/shared/lib/quran-fonts";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import type { Ayah } from "@/types/quran.types";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { usePageAyahs } from "../app/usePageData";
import { QuranPageFooter } from "./QuranPageFooter";
import { QuranPageHeader } from "./QuranPageHeader";

// Item types for the FlatList
type SurahHeaderItem = {
  type: "surah-header";
  surahNumber: number;
  showBasmalah: boolean;
};

type AyahItem = {
  type: "ayah";
  ayah: Ayah;
};

type PageListItem = SurahHeaderItem | AyahItem;

interface PagePageProps {
  pageNumber: number;
}

const VerticalSeparator = () => <View style={{ height: 12 }} />;

export function PagePage({ pageNumber }: PagePageProps) {
  const { data, isLoading, isError } = usePageAyahs(pageNumber);

  // Highlighting logic
  const params = useLocalSearchParams();
  const targetSurah = params.surah
    ? parseInt(params.surah as string, 10)
    : undefined;
  const targetAyah = params.ayah
    ? parseInt(params.ayah as string, 10)
    : undefined;

  // Build list with surah headers - React Compiler handles the memoization of this calculation
  const getListItems = (): PageListItem[] => {
    if (!data?.ayahs?.length) return [];

    const items: PageListItem[] = [];
    let currentSurah: number | null = null;

    for (const ayah of data.ayahs) {
      if (ayah.sura_number !== currentSurah && ayah.ayah_number === 1) {
        const showBasmalah = !BISMALAH_EXCEPTIONS.includes(ayah.sura_number);

        items.push({
          type: "surah-header",
          surahNumber: ayah.sura_number,
          showBasmalah,
        });
      }

      currentSurah = ayah.sura_number;
      items.push({ type: "ayah", ayah });
    }

    return items;
  };

  const listItems = getListItems();

  // Derive page header components - React Compiler handles the memoization of these elements
  const getHeaderComponents = () => {
    if (!data?.ayahs?.length) {
      return { quarterNameComponent: null, suraNamesComponent: null };
    }

    const uniqueSurahIds = Array.from(
      new Set(data.ayahs.map((a) => a.sura_number))
    );

    const suraNamesComponent = (
      <View className="flex-row gap-2">
        {uniqueSurahIds.map((id) => (
          <Text key={id} className="font-surah-name text-xl text-text-primary">
            {getSurahNameGlyph(id)}
          </Text>
        ))}
      </View>
    );

    const quarterNameComponent = data.meta?.juz_number ? (
      <Text className="font-juz-name text-xl text-text-primary">
        {getJuzBadgeGlyph(data.meta.juz_number)}
      </Text>
    ) : null;

    return { quarterNameComponent, suraNamesComponent };
  };

  const { quarterNameComponent, suraNamesComponent } = getHeaderComponents();

  if (isLoading) return <LoadingState />;
  if (isError)
    return <ErrorState message={`Failed to load page ${pageNumber}.`} />;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={listItems}
        keyExtractor={(item) =>
          item.type === "surah-header"
            ? `header-${item.surahNumber}`
            : `ayah-${item.ayah.sura_number}-${item.ayah.ayah_number}`
        }
        ListHeaderComponent={
          <QuranPageHeader
            quarterName={quarterNameComponent}
            suraNames={suraNamesComponent}
          />
        }
        ListFooterComponent={<QuranPageFooter page={pageNumber.toString()} />}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        ItemSeparatorComponent={VerticalSeparator}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => {
          if (item.type === "surah-header") {
            return (
              <View className="items-center py-4">
                <Text
                  className="font-surah-name text-4xl text-text-primary"
                  accessible
                  accessibilityRole="header"
                  accessibilityLabel={`Surah ${item.surahNumber}`}
                >
                  {getSurahNameHeader(item.surahNumber)}
                </Text>

                {item.showBasmalah && (
                  <Text
                    className="font-arabic text-3xl text-text-quran text-center mt-3"
                    accessible
                    accessibilityLanguage="ar"
                    accessibilityLabel="Bismillah ir-Rahman ir-Raheem"
                  >
                    {BASMALAH}
                  </Text>
                )}
              </View>
            );
          }

          const { ayah } = item;
          const isAyahMatch =
            targetSurah === ayah.sura_number && targetAyah === ayah.ayah_number;

          return (
            <AyahCard ayah={ayah} page={pageNumber} highlighted={isAyahMatch} />
          );
        }}
      />
    </View>
  );
}
