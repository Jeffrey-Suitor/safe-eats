import { createTRPCReact } from "@trpc/react";
import { createTRPCProxyClient, createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "@safe-eats/server/routers/_app";
import { splitLink } from "@trpc/client/links/splitLink";
import { httpLink } from "@trpc/client/links/httpLink";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
import Constants from "expo-constants";
const getBaseUrl = (serverType: "http" | "ws") => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   */
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

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
// @ts-ignore
import { connectToDevTools } from "react-devtools-core";

let jwt: string;
export const setJwt = (newJwt: string) => {
  jwt = newJwt;
};

export const TRPCProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
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
                Authorization: jwt,
              };
            },
          }),
        }),
      ],
    })
  );

  if (__DEV__) {
    connectToDevTools({
      host: "localhost",
      port: 8097,
    });
    import("react-query-native-devtools").then(({ addPlugin }) => {
      addPlugin({ queryClient });
    });
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
