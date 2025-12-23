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
    <View className="flex-1 bg-background">
      <FlatList
        data={juzList}
        renderItem={({ item }) => <JuzListItem juz={item} />}
        keyExtractor={(item) => item.juz_number.toString()}
        contentContainerClassName="px-4 pb-4"
        ItemSeparatorComponent={() => <View className="h-6" />}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        accessible
        accessibilityRole="list"
        accessibilityLabel="List of Quran parts (Juz)"
      />
    </View>
  );
}
