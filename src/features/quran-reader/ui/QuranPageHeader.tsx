import React from "react";
import { Text, View } from "react-native";

interface QuranPageHeaderProps {
  quarterName?: React.ReactNode;
  suraNames?: React.ReactNode;
}

export function QuranPageHeader({
  quarterName,
  suraNames,
}: QuranPageHeaderProps) {
  if (!quarterName && !suraNames) return null;

  return (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
      {/* Juz Name Section */}
      <View className="flex-row items-center">
        {typeof quarterName === "string" ? (
          <Text className="font-ui-en text-xs text-text-secondary">
            {quarterName}
          </Text>
        ) : (
          quarterName
        )}
      </View>

      {/* Surah Name Section */}
      <View className="flex-row items-center">
        {typeof suraNames === "string" ? (
          <Text className="font-ui-en text-xs text-text-secondary text-right">
            {suraNames}
          </Text>
        ) : (
          suraNames
        )}
      </View>
    </View>
  );
}
