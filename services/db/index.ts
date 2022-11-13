import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// eslint-disable-next-line turbo/no-undeclared-env-vars
dotenv.config({ path: "../../.env" });
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: "1.0",
  tracesSampleRate: 1.0,
  integrations: [new Tracing.Integrations.Prisma({ client: prisma }) as any],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
