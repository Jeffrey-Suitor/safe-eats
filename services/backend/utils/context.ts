import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { IncomingMessage } from "http";
import ws from "ws";
import { decryptAccessToken } from "./jwt";
import { UserSchema } from "@safe-eats/types/userTypes";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  opts:
    | trpcNext.CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  const context = {
    req: opts?.req,
    res: opts?.res,
    user: null,
  };
  try {
    const jwt = opts?.req?.headers?.authorization?.split(" ")[1];
    const userJwt = decryptAccessToken(jwt);
    const user = UserSchema.parse(userJwt);
    return {
      ...context,
      user,
    };
  } catch (e) {
    console.log("Failed to create context");
    return context;
  }
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
