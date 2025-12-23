import React from "react";
import { Text, View } from "react-native";
import type { JuzData, Surah } from "../../types/quran.types";
import { SurahListItem } from "./SurahListItem";

interface JuzListItemProps {
  juz: JuzData;
}

export function JuzListItem({ juz }: JuzListItemProps) {
  return (
    <View
      className="mb-6"
      accessible
      accessibilityLabel={`Juz ${juz.juz_number}`}
    >
      <View className="mb-4 px-1">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-lg bg-accent items-center justify-center">
            <Text className="font-ui-en text-base font-bold text-white">
              {juz.juz_number}
            </Text>
          </View>
          <View>
            <Text className="font-ui-en text-lg font-bold text-text-primary">
              Juz {juz.juz_number}
            </Text>
            <Text className="font-ui-ar text-sm text-text-secondary">
              الجزء {juz.juz_number}
            </Text>
          </View>
        </View>
        <View className="h-px bg-border-subtle mt-3" />
      </View>

      <View className="gap-2">
        {juz.surahs.map((surah: Surah) => (
          <SurahListItem key={surah.id} surah={surah} />
        ))}
      </View>
    </View>
  );
}
