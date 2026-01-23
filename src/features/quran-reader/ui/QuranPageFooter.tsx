import { Trans } from "@lingui/react/macro";
import { Text, View } from "react-native";
interface QuranPageFooterProps {
  page: string;
}

export function QuranPageFooter({ page }: QuranPageFooterProps) {
  return (
    <View className="flex-row items-center justify-center pt-2 pb-4 px-4">
      <Text className="text-sm text-text-secondary">
        <Trans>{page}</Trans>
      </Text>
    </View>
  );
}
