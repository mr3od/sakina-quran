/**
 * Page Route - /pages/[number]
 * Main route for page-by-page Quran reading
 */

import { PageReaderScreen } from "@/features/quran-reader/ui";
import { Stack, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import { Platform } from "react-native";

export default function PageRoute() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const pageNumber = parseInt(number || "1", 10);

  return (
    <>
      <Head>
        <title>Quran Page {pageNumber} - Sakina Quran</title>
        <meta
          name="description"
          content={`Read Quran page ${pageNumber} - Arabic text with English interface.`}
        />
        <meta
          name="keywords"
          content={`Quran page ${pageNumber}, Islamic text, Arabic verses, Quran reading, Holy Quran`}
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`Quran Page ${pageNumber} - Sakina Quran`}
        />
        <meta
          property="og:description"
          content={`Read Quran page ${pageNumber} - Arabic text with English interface.`}
        />
        <meta
          property="og:url"
          content={`https://quran.mr3od.dev/pages/${pageNumber}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://quran.mr3od.dev/icon.png" />

        {/* Twitter */}
        <meta
          property="twitter:title"
          content={`Quran Page ${pageNumber} - Sakina Quran`}
        />
        <meta
          property="twitter:description"
          content={`Read Quran page ${pageNumber} with beautiful Arabic text.`}
        />
        <meta
          property="twitter:url"
          content={`https://quran.mr3od.dev/pages/${pageNumber}`}
        />
        <meta
          property="twitter:image"
          content="https://quran.mr3od.dev/icon.png"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`https://quran.mr3od.dev/pages/${pageNumber}`}
        />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Quran Page ${pageNumber}`,
            description: `Read Quran page ${pageNumber} with beautiful Arabic text`,
            url: `https://quran.mr3od.dev/pages/${pageNumber}`,
            author: {
              "@type": "Organization",
              name: "Sakina Quran",
            },
            publisher: {
              "@type": "Organization",
              name: "Sakina Quran",
              logo: {
                "@type": "ImageObject",
                url: "https://quran.mr3od.dev/icon.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://quran.mr3od.dev/pages/${pageNumber}`,
            },
          })}
        </script>
      </Head>
      <Stack.Screen
        options={{
          headerShown: Platform.OS === "web",
          title: `Quran Page ${pageNumber}`,
          headerBackTitle: "Home",
        }}
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
