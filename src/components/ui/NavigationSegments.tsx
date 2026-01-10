import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Segment = { id: string; label: string; labelAr?: string };

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

    const prev = layoutsRef.current[id];
    if (prev && prev.x === x && prev.width === width) return;

    layoutsRef.current[id] = { x, width };

    // Resize-safe: when the ACTIVE segment lays out, update the pill immediately.
    if (id === activeSegment) {
      setIndicatorRef.current(x, width, initRef.current);
      if (!ready) setReady(true);
    }
  };

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

        return (
          <View
            key={segment.id}
            className="flex-1"
            onLayout={onSegmentLayout(segment.id)}
          >
            <Pressable
              onPress={() => onSelect(segment.id)}
              className="py-1 items-center justify-center rounded-md flex-col sm:flex-row sm:gap-2"
              style={{ minHeight: 40 }}
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
                } font-ui-en text-xs font-semibold text-center`}
                style={{ opacity: isActive ? 1 : 0.85 }}
              >
                {segment.label}
              </Text>

              {segment.labelAr && (
                <Text
                  className={`${
                    isActive ? "text-white opacity-90" : "text-text-tertiary"
                  } font-ui-ar text-xs text-center`}
                  style={{ opacity: isActive ? 0.9 : 0.7 }}
                >
                  {segment.labelAr}
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
