import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <View className="w-16 h-16 bg-error/10 rounded-full items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={32} className="text-error" />
      </View>
      <Text className="text-text-primary text-lg font-bold text-center mb-2">
        Error
      </Text>
      <Text className="text-text-secondary text-center mb-6">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-on-primary font-medium">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
