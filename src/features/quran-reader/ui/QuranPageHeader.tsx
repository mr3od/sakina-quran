import { Trans } from "@lingui/react/macro";
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
    <View className="flex-col items-center justify-center px-4 py-6 border-t border-border-subtle/30 opacity-80">
      <View className="flex-row items-center gap-6">
        {/* Juz Section */}
        {quarterName && (
          <View className="flex-row items-center">
            {typeof quarterName === "string" ? (
              <Text className="font-ui-en text-xs text-text-tertiary">
                <Trans>{quarterName}</Trans>
              </Text>
            ) : (
              quarterName
            )}
          </View>
        )}

        {/* Separator if both exist */}
        {quarterName && suraNames && (
          <View className="w-1 h-1 rounded-full bg-border-base" />
        )}

        {/* Surah Section */}
        {suraNames && (
          <View className="flex-row items-center">
            {typeof suraNames === "string" ? (
              <Text className="font-ui-en text-xs text-text-tertiary">
                <Trans>{suraNames}</Trans>
              </Text>
            ) : (
              suraNames
            )}
          </View>
        )}
      </View>
    </View>
  );
}
