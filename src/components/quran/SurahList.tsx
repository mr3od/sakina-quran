import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useLingui } from "@lingui/react/macro";
import { View } from "react-native";
import { useSurahs } from "../../hooks/useSurahs";
import { SurahListItem } from "./SurahListItem";

export function SurahListScreen() {
  const { t } = useLingui();
  const { data: surahs, isLoading, isError, error } = useSurahs();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState message={error?.message || t`Failed to load Surahs`} />;
  }

  return (
    <View className="px-4 sm:px-8 pb-8">
      <View className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
        {/* Grid layout for web */}
        <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {surahs?.map((surah) => (
            <SurahListItem key={surah.id} surah={surah} />
          ))}
        </View>
      </View>
    </View>
  );
}
