import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { BootstrapProvider } from "@/providers/bootstrap-context";
import { NetworkProvider } from "@/providers/network-context";
import { ThemeProvider } from "@/providers/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NetworkProvider>
          <BootstrapProvider>{children}</BootstrapProvider>
        </NetworkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
