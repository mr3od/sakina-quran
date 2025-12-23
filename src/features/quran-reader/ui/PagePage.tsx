import { AyahCard } from "@/components/quran/AyahCard";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { usePageAyahs } from "../app/usePageData";

export function PagePage({ pageNumber }: { pageNumber: number }) {
  const { data, isLoading, isError } = usePageAyahs(pageNumber);

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
        renderItem={({ item }) => <AyahCard ayah={item} page={pageNumber} />}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}
