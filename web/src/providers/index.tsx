"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { AppearanceProvider } from "@/components/dashboard/settings/appearance-provider";
import { ScrollbarBehavior } from "@/components/scrollbar-behavior";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="school-lms-theme">
          <AppearanceProvider>
            <ScrollbarBehavior />
            {children}
          </AppearanceProvider>
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "bg-card border-border text-card-foreground rounded-lg shadow-float",
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
