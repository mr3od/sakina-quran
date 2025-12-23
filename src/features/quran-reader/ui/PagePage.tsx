import { AyahCard } from "@/components/quran/AyahCard";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { usePageAyahs } from "../app/usePageData";

interface PagePageProps {
  pageNumber: number;
}

export function PagePage({ pageNumber }: PagePageProps) {
  const { data, isLoading, isError } = usePageAyahs(pageNumber);

  const params = useLocalSearchParams();
  const targetSurah = params.surah
    ? parseInt(params.surah as string, 10)
    : undefined;
  const targetAyah = params.ayah
    ? parseInt(params.ayah as string, 10)
    : undefined;

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message={`Failed to load page ${pageNumber}.`} />;
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={data ?? []}
        keyExtractor={(a) => `${a.sura_number}-${a.ayah_number}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => {
          // specific ayah highlight
          const isAyahMatch =
            targetSurah === item.sura_number && targetAyah === item.ayah_number;
          // surah start highlight (if only surah provided)
          const isSurahStartMatch =
            !targetAyah &&
            targetSurah === item.sura_number &&
            item.ayah_number === 1;

          const shouldHighlight = isAyahMatch || isSurahStartMatch;

          return (
            <AyahCard
              ayah={item}
              page={pageNumber}
              highlighted={shouldHighlight}
            />
          );
        }}
      />
    </View>
  );
}
