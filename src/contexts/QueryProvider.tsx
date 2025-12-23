import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { AppState, Platform } from "react-native";

// Configure focus manager for React Native
// Ensures queries respect app foreground/background state
function onAppStateChange(status: string) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

// Create QueryClient with conservative defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      // Disable automatic refetching (overridden per hook)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (Platform.OS !== "web") {
      const subscription = AppState.addEventListener(
        "change",
        onAppStateChange,
      );
      return () => subscription.remove();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
