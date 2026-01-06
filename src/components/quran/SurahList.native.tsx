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
    <View className="flex-1 bg-background px-4 sm:px-8 pb-8">
      <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
        <FlatList
          data={surahs}
          renderItem={({ item }) => <SurahListItem surah={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          key="single-column"
          columnWrapperStyle={undefined}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          accessible
          accessibilityRole="list"
          accessibilityLabel="List of Quran chapters"
        />
      </View>
    </View>
  );
}
