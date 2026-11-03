import "server-only";

import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { appRouter, type AppRouter } from "@/server/router";
import { makeQueryClient } from "./query-client";

const getQueryClient = cache(makeQueryClient);

const caller = appRouter.createCaller({});

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(caller, getQueryClient);
