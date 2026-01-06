import { useLastReadPosition } from "@/hooks/useLastReadPosition";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function ContinueReadingCard() {
  const accentColor = useCSSVariable("--color-accent");
  const { lastRead, surahName, isLoading } = useLastReadPosition();

  if (isLoading) return null;

  // Fallback: Start Reading card for first-time users
  if (!lastRead) {
    return (
      <Link
        href="/pages/1"
        asChild
        accessibilityLabel="Start reading from page 1"
        accessibilityHint="Begin reading the Quran from the first page"
      >
        <View
          className="bg-surface border border-border rounded-xl p-6 active:bg-surface-elevated"
          accessibilityRole="button"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center mr-4">
              <Ionicons
                name="book-outline"
                size={24}
                color={accentColor as string}
              />
            </View>
            <View className="flex-1">
              <Text className="font-ui-en text-base font-semibold text-text-primary mb-1">
                Start Reading
              </Text>
              <Text className="font-ui-en text-sm text-text-secondary">
                Begin from Page 1
              </Text>
            </View>
          </View>
          <Text className="font-ui-ar text-2xl text-text-primary text-center">
            ابدأ القراءة
          </Text>
        </View>
      </Link>
    );
  }

  // Continue Reading card for returning users
  return (
    <Link
      href={`/pages/${lastRead.page_number}` as any}
      asChild
      accessibilityLabel={`Continue reading ${surahName}, page ${lastRead.page_number}`}
      accessibilityHint="Navigate to your last read position"
    >
      <View
        className="bg-accent/10 border border-accent rounded-xl p-6 active:bg-accent/20"
        accessibilityRole="button"
      >
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center mr-4">
            <Ionicons
              name="book-outline"
              size={24}
              color={accentColor as string}
            />
          </View>
          <View className="flex-1">
            <Text className="font-ui-en text-base font-semibold text-accent mb-1">
              Continue Reading
            </Text>
            <Text className="font-ui-en text-sm text-text-secondary">
              Page {lastRead.page_number}
            </Text>
          </View>
        </View>
        <Text className="font-ui-ar text-2xl text-text-primary text-center">
          {surahName}
        </Text>
      </View>
    </Link>
  );
}
