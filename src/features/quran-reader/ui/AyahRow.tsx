import type { Ayah } from "@/types/quran.types";
import React from "react";
import { Text, View } from "react-native";

export function AyahRow({ ayah }: { ayah: Ayah }) {
  return (
    <View className="bg-surface rounded-lg p-4 border border-border-subtle">
      <Text
        className="font-arabic text-text-quran text-right"
        style={{ fontSize: 28, lineHeight: 28 * 2.1 }}
        selectable
        accessibilityLanguage="ar"
      >
        {ayah.uthmani_text}
      </Text>
      <Text className="mt-2 font-ui-en text-xs text-text-tertiary">
        {ayah.sura_number}:{ayah.ayah_number}
      </Text>
    </View>
  );
}
