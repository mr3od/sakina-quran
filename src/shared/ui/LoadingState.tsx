import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function LoadingState() {
  const accentColor = useCSSVariable("--color-accent");

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <ActivityIndicator size="large" color={accentColor as string} />
    </View>
  );
}
