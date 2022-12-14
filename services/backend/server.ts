import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({ path: "../../.env" });
import { createContext } from "./utils/context";
import { appRouter } from "./routers/_app";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import fetch from "node-fetch";
import ws from "ws";
import ip from "ip";

export type AppRouter = typeof appRouter;

if (!global.fetch) {
  (global as any).fetch = fetch;
}
const port = 3001;

// http server
const { server, listen } = createHTTPServer({
  router: appRouter,
  createContext,
});

// ws server
const wss = new ws.Server({ server });
const handler = applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

wss.on("connection", (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log(
  `✅ WebSocket Server listening on ws://localhost:${port} || ws://${ip.address()}:${port}`
);
console.log(
  `✅ HTTP Server listening on http://localhost:${port} || http://${ip.address()}:${port}`
);

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});

listen(port);
