// src/app/+html.tsx
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
import "../global.css";

const responsiveBackground = `
body { background-color: #ffffff; }
@media (prefers-color-scheme: dark) {
  body { background-color: #0f172a; }
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Make ScrollView behave more like native on web */}
        <ScrollViewStyleReset />

        {/* Prevent background flicker */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

        {/* Static Mixed Meta for SEO consistency */}
        <title>Sakina Quran - سكينة القرآن</title>
        <meta
          name="description"
          content="Sakina Quran - Read the Holy Quran with a calm, beautiful experience | سكينة القرآن - اقرأ القرآن الكريم بتجربة هادئة وجميلة."
        />

        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0f172a" />
      </head>

      <body>{children}</body>
    </html>
  );
}
