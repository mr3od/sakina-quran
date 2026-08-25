import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react-native";
import React from "react";
import { messages as arMessages } from "@/locales/ar/messages.po";
import { messages as enMessages } from "@/locales/en/messages.po";

i18n.load({ en: enMessages, ar: arMessages });

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
}

export async function renderWithProviders(
  ui: React.ReactElement,
  {
    locale = "en",
    queryClient = createTestQueryClient(),
    ...options
  }: RenderOptions & { locale?: string; queryClient?: QueryClient } = {},
) {
  i18n.activate(locale);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nProvider i18n={i18n}>{children}</I18nProvider>
      </QueryClientProvider>
    );
  }

  return { ...(await render(ui, { wrapper: Wrapper, ...options })), queryClient };
}
