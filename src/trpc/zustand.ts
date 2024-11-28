import { type AppRouter } from "@/server/api/root";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { getBaseUrl } from "./react";
import SuperJSON from "superjson";

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "zustand");
        return headers;
      },
    }),
  ],
});
