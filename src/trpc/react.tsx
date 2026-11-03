"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchStreamLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/router";
import { getQueryClient } from "./query-client";
import { ToastProvider } from "@/components/ui/Toast";

export const trpc = createTRPCReact<AppRouter>();

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchStreamLink({ url: "/api/trpc", transformer: superjson })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
