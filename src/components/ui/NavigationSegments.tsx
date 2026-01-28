import { useLocaleFont } from "@/hooks/useLocaleFont";
import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react/macro";
import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Segment = {
  id: string;
  label: string | MessageDescriptor;
};

interface NavigationSegmentsProps {
  segments: readonly Segment[];
  activeSegment: string;
  onSelect: (id: string) => void;
}

type LayoutMap = Record<string, { x: number; width: number }>;

const DURATION = 220;
const easing = Easing.out(Easing.cubic);

export function NavigationSegments({
  segments,
  activeSegment,
  onSelect,
}: NavigationSegmentsProps) {
  const { i18n, t } = useLingui();
  const fontClass = useLocaleFont();
  const layoutsRef = useRef<LayoutMap>({});
  const [ready, setReady] = useState(false);

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const hasInit = useSharedValue(false);

  // React-side init flag (so hooks don't depend on hasInit.value)
  const initRef = useRef(false);

  // Stable function ref (so hooks don't depend on setIndicator)
  const setIndicatorRef = useRef<
    (x: number, width: number, animate: boolean) => void
  >(() => {});

  setIndicatorRef.current = (x: number, width: number, animate: boolean) => {
    if (!animate) {
      indicatorX.value = x;
      indicatorW.value = width;
      hasInit.value = true;
      initRef.current = true;
      return;
    }

    indicatorX.value = withTiming(x, { duration: DURATION, easing });
    indicatorW.value = withTiming(width, { duration: DURATION, easing });
  };

  const onSegmentLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;

    // We don't skip the update even if coordinates are the same,
    // because React context (like RTL or locale) might have changed.

    layoutsRef.current[id] = { x, width };

    // Resize-safe: when the ACTIVE segment lays out, update the pill immediately.
    if (id === activeSegment) {
      setIndicatorRef.current(x, width, initRef.current);
      if (!ready) setReady(true);
    }
  };

  useEffect(() => {
    setReady(false);
    layoutsRef.current = {};
    hasInit.value = false;
    initRef.current = false;
  }, [i18n.locale]);

  useEffect(() => {
    if (!ready) return;

    const m = layoutsRef.current[activeSegment];
    if (!m) return;

    setIndicatorRef.current(m.x, m.width, initRef.current);
  }, [activeSegment, ready]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    opacity: hasInit.value ? 1 : 0,
  }));

  return (
    <View
      className="p-1 rounded-lg bg-surface-elevated flex-row gap-1 w-full"
      accessible
      accessibilityRole="tablist"
      style={{ position: "relative" }}
    >
      <Animated.View
        pointerEvents="none"
        className="bg-accent shadow-sm rounded-md"
        style={[
          { position: "absolute", top: 4, bottom: 4, left: 0 },
          indicatorStyle,
        ]}
      />

      {segments.map((segment) => {
        const isActive = activeSegment === segment.id;
        const labelText =
          typeof segment.label === "string"
            ? segment.label
            : i18n._(segment.label);

        return (
          <View
            key={`${segment.id}-${i18n.locale}`}
            className="flex-1"
            onLayout={onSegmentLayout(segment.id)}
          >
            <Pressable
              onPress={() => {
                if (!isActive) onSelect(segment.id);
              }}
              className="py-1 items-center justify-center rounded-md flex-col sm:flex-row sm:gap-2"
              style={{ minHeight: 40 }}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t`${labelText} tab${isActive ? ", selected" : ""}`}
            >
              <Text
                className={`${
                  isActive ? "text-white" : "text-text-secondary"
                } ${fontClass} text-xs font-semibold text-center`}
                style={{ opacity: isActive ? 1 : 0.85 }}
              >
                {labelText}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
