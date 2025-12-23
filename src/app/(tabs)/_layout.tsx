// src/app/(tabs)/_layout.tsx

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCSSVariable } from "uniwind";

/**
 * Sakinah Design System - Tab Navigation
 * Explicitly styled per theme (no implicit adaptation).
 */
export default function TabLayout() {
  const [bgColor, textColor, borderColor, accentColor, inactiveColor] =
    useCSSVariable([
      "--color-background",
      "--color-text-primary",
      "--color-border-subtle",
      "--color-accent",
      "--color-text-tertiary",
    ]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: bgColor as string,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontFamily: "Inter_400Regular",
          fontSize: 18,
          fontWeight: "600",
          color: textColor as string,
        },
        headerTintColor: textColor as string,

        tabBarStyle: {
          backgroundColor: bgColor as string,
          borderTopColor: borderColor as string,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: accentColor as string,
        tabBarInactiveTintColor: inactiveColor as string,
        tabBarLabelStyle: {
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarAccessibilityLabel: "Navigation tabs",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
              accessible
              accessibilityLabel="Home tab icon"
            />
          ),
          tabBarAccessibilityLabel: "Home tab, navigate to Quran reading",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={size}
              color={color}
              accessible
              accessibilityLabel="Search tab icon"
            />
          ),
          tabBarAccessibilityLabel: "Search tab, search Quran verses",
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          headerShown: false,
          tabBarLabel: "Bookmarks",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
              accessible
              accessibilityLabel="Bookmarks tab icon"
            />
          ),
          tabBarAccessibilityLabel: "Bookmarks tab, view your saved verses",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
              accessible
              accessibilityLabel="Settings tab icon"
            />
          ),
          tabBarAccessibilityLabel: "Settings tab, manage app preferences",
        }}
      />
    </Tabs>
  );
}
