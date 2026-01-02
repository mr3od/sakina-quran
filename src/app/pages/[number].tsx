/**
 * Page Route - /pages/[number]
 * Main route for page-by-page Quran reading
 */

import { PageReaderScreen } from "@/features/quran-reader/ui";

export default function PageRoute() {
  return <PageReaderScreen />;
}

export async function generateStaticParams(): Promise<{ number: string }[]> {
  return Array.from({ length: 604 }, (_, i) => ({
    number: (i + 1).toString(),
  }));
}
