// src/components/ui/NavigationSegments.tsx

import React from "react";
import { Pressable, Text, View } from "react-native";

type Segment = {
  id: string;
  label: string;
  labelAr?: string;
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
  return (
    <View
      className="p-1 rounded-lg bg-surface-elevated flex-row gap-1"
      accessible
      accessibilityRole="tablist"
    >
      {segments.map((segment) => {
        const isActive = activeSegment === segment.id;
        return (
          <Pressable
            key={segment.id}
            onPress={() => onSelect(segment.id)}
            className={`
              flex-1 py-3 px-4 items-center justify-center rounded-md
              ${
                isActive
                  ? "bg-accent shadow-sm rounded-md"
                  : "bg-transparent active:bg-surface-elevated"
              }
            `}
            style={{
              borderRadius: 10,
            }}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${segment.label} tab${
              isActive ? ", selected" : ""
            }`}
          >
            <Text
              className={`${
                isActive ? "text-white" : "text-text-secondary"
              } font-ui-en text-sm font-semibold`}
            >
              {segment.label}
            </Text>
            {segment.labelAr && (
              <Text
                className={`${
                  isActive ? "text-white opacity-90" : "text-text-tertiary"
                } font-ui-ar text-xs mt-1`}
              >
                {segment.labelAr}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
