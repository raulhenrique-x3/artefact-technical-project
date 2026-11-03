import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Necessário para o SSR baseado em promessas (@trpc/react-query/rsc)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        serializeData: superjson.serialize,
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  return (browserQueryClient ??= makeQueryClient());
}
