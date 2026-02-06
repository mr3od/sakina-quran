import { useLocaleFont } from "@/hooks/useLocaleFont";
import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";

type Segment = {
  id: string;
  label: string | MessageDescriptor;
};

interface NavigationSegmentsProps {
  segments: readonly Segment[];
  activeSegment: string;
  onSelect: (id: string) => void;
}

export function NavigationSegments({
  segments,
  activeSegment,
  onSelect,
}: NavigationSegmentsProps) {
  const { i18n, t } = useLingui();
  const fontClass = useLocaleFont();

  return (
    <View
      className="p-1 rounded-lg bg-surface-elevated flex-row gap-1 w-full"
      accessibilityRole="tablist"
    >
      {segments.map((segment) => {
        const isActive = activeSegment === segment.id;

        const labelText =
          typeof segment.label === "string"
            ? segment.label
            : i18n._(segment.label);

        return (
          <Pressable
            key={segment.id}
            onPress={() => !isActive && onSelect(segment.id)}
            className="flex-1"
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t`${labelText} tab${isActive ? ", selected" : ""}`}
          >
            <Animated.View
              layout={LinearTransition.duration(300).easing(
                Easing.inOut(Easing.cubic),
              )}
              className={`rounded-md py-1 items-center justify-center ${
                isActive ? "bg-accent shadow-sm" : "bg-transparent"
              }`}
              style={{ minHeight: 40 }}
            >
              <Text
                className={`${
                  isActive ? "text-white" : "text-text-secondary"
                } ${fontClass} text-xs font-semibold text-center`}
                style={{ opacity: isActive ? 1 : 0.85 }}
              >
                {labelText}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}
