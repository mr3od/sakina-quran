import { useLastReadPosition } from "@/hooks/useLastReadPosition";
import { Ionicons } from "@expo/vector-icons";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function ContinueReadingCard() {
  const { t } = useLingui();
  const accentColor = useCSSVariable("--color-accent");
  const { lastRead, surahName, isLoading } = useLastReadPosition();

  if (isLoading) return null;

  // Fallback: Start Reading card for first-time users
  if (!lastRead) {
    return (
      <Link href="/pages/1" asChild>
        <Pressable
          className="bg-surface border border-border rounded-xl p-6 active:bg-surface-elevated"
          accessibilityRole="button"
          accessibilityLabel={t`Start reading from page 1`}
          accessibilityHint={t`Begin reading the Quran from the first page`}
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
              <Text className="text-base font-semibold text-text-primary mb-1">
                <Trans>Start Reading</Trans>
              </Text>
              <Text className="text-sm text-text-secondary">
                <Trans>Begin from Page 1</Trans>
              </Text>
            </View>
          </View>
          <Text className="text-2xl text-text-primary text-center">
            <Trans>Start Reading</Trans>
          </Text>
        </Pressable>
      </Link>
    );
  }

  // Continue Reading card for returning users
  return (
    <Link href={`/pages/${lastRead.page_number}`} asChild>
      <Pressable
        className="bg-accent/10 border border-accent rounded-xl p-6 active:bg-accent/20"
        accessibilityRole="button"
        accessibilityLabel={t`Continue reading ${surahName}, page ${lastRead.page_number}`}
        accessibilityHint={t`Navigate to your last read position`}
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
            <Text className="text-base font-semibold text-accent mb-1">
              <Trans>Continue Reading</Trans>
            </Text>
            <Text className="text-sm text-text-secondary">
              <Trans>Page {lastRead.page_number}</Trans>
            </Text>
          </View>
        </View>
        <Text className="font-ui-ar text-2xl text-text-primary text-center">
          {surahName}
        </Text>
      </Pressable>
    </Link>
  );
}
