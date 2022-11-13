import { createTRPCReact } from "@trpc/react";
import { createWSClient, loggerLink, wsLink } from "@trpc/client";
import type { AppRouter } from "@safe-eats/server/routers/_app";
import { splitLink } from "@trpc/client/links/splitLink";
import { httpLink } from "@trpc/client/links/httpLink";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import * as SecureStore from "expo-secure-store";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (serverType: "http" | "ws") => {
  const localhost = Constants.manifest?.debuggerHost?.split(":")[0];
  if (!localhost)
    throw new Error("failed to get localhost, configure it manually");
  return serverType == "ws"
    ? `ws://${localhost}:3001`
    : `http://${localhost}:3001`;
};

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `${getBaseUrl("ws")}`,
});

let jwt: string;
export const setJwt = async (newJwt: string) => {
  jwt = newJwt;
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY not set");
  }
  SecureStore.setItemAsync(process.env.JWT_KEY, newJwt);
};

export const TRPCProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        // call subscriptions through websockets and the rest over http
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          true: wsLink({
            client: wsClient,
          }),
          false: httpLink({
            url: `${getBaseUrl("http")}`,
            headers() {
              return {
                Authorization: `Bearer ${jwt}`,
              };
            },
          }),
        }),
      ],
    })
  );

  // if (__DEV__) {
  //   connectToDevTools({
  //     host: "localhost",
  //     port: 8097,
  //   });
  // }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
