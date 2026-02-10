/**
 * SEOHead - Reusable SEO Meta Tags Component
 * Centralizes all SEO meta tag logic to eliminate duplication
 */

import { useLingui } from "@lingui/react/macro";
import Head from "expo-router/head";
import React from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
  image?: string;
}

export function SEOHead({
  title,
  description,
  url = "https://quran.mr3od.dev/",
  type = "website",
  keywords,
  image = "https://quran.mr3od.dev/icon.png",
}: SEOHeadProps) {
  const { i18n } = useLingui();
  const isAr = i18n.locale === "ar";
  const locale = isAr ? "ar_SA" : "en_US";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Sakina Quran" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Sakina Quran" />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content={isAr ? "Arabic" : "English"} />
      <meta name="revisit-after" content="7 days" />

      {/* Schema.org structured data for articles */}
      {type === "article" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: description,
            url: url,
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
              "@id": url,
            },
          })}
        </script>
      )}

      {/* Schema.org structured data for website */}
      {type === "website" && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sakina Quran",
            description: description,
            url: url,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web, iOS, Android",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Organization",
              name: "Sakina Quran",
            },
          })}
        </script>
      )}
    </Head>
  );
}
