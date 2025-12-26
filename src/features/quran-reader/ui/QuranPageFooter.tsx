import React from "react";
import { Text, View } from "react-native";

interface QuranPageFooterProps {
  page: string;
}

export function QuranPageFooter({ page }: QuranPageFooterProps) {
  return (
    <View className="flex-row items-center justify-center pt-2 pb-4 px-4">
      <Text className="font-ui-en text-sm text-text-secondary">{page}</Text>
    </View>
  );
}
