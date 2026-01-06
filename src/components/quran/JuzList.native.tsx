// src/components/quran/JuzList.tsx

import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { FlatList, View } from "react-native";
import { useJuzList } from "../../hooks/useJuzList";
import { JuzListItem } from "./JuzListItem";

export function JuzListScreen() {
  const { data: juzList, isLoading, isError, error } = useJuzList();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message={error?.message || "Failed to load Juz list"} />;
  }

  return (
    <View className="flex-1 bg-background px-4 sm:px-8 pb-8">
      <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
        <FlatList
          data={juzList}
          renderItem={({ item }) => <JuzListItem juz={item} />}
          keyExtractor={(item) => item.juz_number.toString()}
          numColumns={1}
          key="single-column"
          columnWrapperStyle={undefined}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          accessible
          accessibilityRole="list"
          accessibilityLabel="List of Quran parts (Juz)"
        />
      </View>
    </View>
  );
}
