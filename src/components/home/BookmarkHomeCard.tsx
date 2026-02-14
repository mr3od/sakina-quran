import { toPageRoute } from "@/features/quran-reader/app/quran-reader-route";
import { useAyah } from "@/hooks/useAyah";
import { useLingui } from "@lingui/react/macro";
import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface BookmarkHomeCardProps {
  sura: number;
  ayah: number;
  page: number;
  surahName: string;
}

export function BookmarkHomeCard({
  sura,
  ayah,
  page,
  surahName,
}: BookmarkHomeCardProps) {
  const { t } = useLingui();
  const { data: ayahData, isLoading } = useAyah(sura, ayah);

  return (
    <Link href={toPageRoute(page, sura, ayah)} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t`Bookmark: ${surahName}, Ayah ${ayah}`}
        accessibilityHint={t`Double tap to navigate to verse`}
        className="bg-surface border border-border rounded-xl p-4 active:bg-surface-elevated active:scale-99"
      >
        <View className="mb-2">
          <Text className="text-text-secondary text-xs font-medium">
            {surahName} • {ayah}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            className="py-2"
            colorClassName="accent-accent"
          />
        ) : ayahData ? (
          <Text
            className="font-arabic text-text-quran text-xl"
            style={{
              writingDirection: "rtl",
              direction: "rtl",
            }}
            accessibilityLanguage="ar"
            accessibilityLabel={ayahData.uthmani_text}
          >
            {ayahData.uthmani_text}
          </Text>
        ) : (
          <Text className="text-sm text-text-tertiary py-2">
            {`${sura}:${ayah}`}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
