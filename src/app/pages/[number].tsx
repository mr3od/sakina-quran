/**
 * Page Route - /pages/[number]
 * Main route for page-by-page Quran reading
 */

import { PageReaderScreen } from "@/features/quran-reader/ui";
import { parsePageNumber } from "@/shared/lib/quran-navigation";
import { SEOHead } from "@/shared/ui/SEOHead";
import { useLingui } from "@lingui/react/macro";
import { useLocalSearchParams } from "expo-router";

export default function PageRoute() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const pageNumber = parsePageNumber(number, 1);
  const { t } = useLingui();

  return (
    <>
      <SEOHead
        title={t`Quran Page ${pageNumber} - Sakina Quran`}
        description={t`Read Page ${pageNumber} of the Holy Quran.`}
        url={`https://quran.mr3od.dev/pages/${pageNumber}`}
        type="article"
        keywords={t`Quran page ${pageNumber}, Islamic text, Arabic verses, Quran reading, Holy Quran`}
      />

      <PageReaderScreen />
    </>
  );
}

export async function generateStaticParams(): Promise<{ number: string }[]> {
  return Array.from({ length: 604 }, (_, i) => ({
    number: (i + 1).toString(),
  }));
}
