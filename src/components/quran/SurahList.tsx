import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { FlatList, View } from "react-native";
import { useSurahs } from "../../hooks/useSurahs";
import { SurahListItem } from "./SurahListItem";

export function SurahListScreen() {
  const { data: surahs, isLoading, isError, error } = useSurahs();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message={error?.message || "Failed to load Surahs"} />;
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={surahs}
        renderItem={({ item }) => <SurahListItem surah={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-4 pb-4"
        ItemSeparatorComponent={() => <View className="h-2" />}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        accessible
        accessibilityRole="list"
        accessibilityLabel="List of Quran chapters"
      />
    </View>
  );
}
