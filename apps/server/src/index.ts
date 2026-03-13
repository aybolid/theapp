import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import z from "zod";

import { pool } from "./db";
import { prepareDatabase } from "./db/prepare";
import { checkEnv } from "./env";
import { auth } from "./modules/auth";
import { f1 } from "./modules/f1";
import { misc } from "./modules/misc";
import { profiles } from "./modules/profiles";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";
import { logger } from "./utils/logger";

const PORT = 3000;

checkEnv();
await prepareDatabase();

const api = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(profiles)
  .use(wishes)
  .use(misc)
  .use(users)
  .use(f1);

const app = new Elysia({ allowUnsafeValidationDetails: true })
  .on("stop", async () => {
    logger.info("Server stopping. Closing database connections...");
    await pool.end();
    logger.info("Database connection pool closed.");
    process.exit(0);
  })
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, url: request.url },
      "Incoming request.",
    );
  })
  .onAfterResponse(({ request, set }) => {
    logger.info(
      { method: request.method, url: request.url, status: set.status },
      "Response sent.",
    );
  })
  .onError((ctx) => {
    const logData = { code: ctx.code, error: ctx.error, url: ctx.request.url };
    if (typeof ctx.code !== "number" && ctx.code !== "VALIDATION") {
      logger.error(logData, "Request failed.");
    } else {
      logger.debug(logData, "Request failed (expected).");
    }
  })
  .use(
    openapi({
      enabled: !isProduction,
      mapJsonSchema: { zod: z.toJSONSchema },
      scalar: { agent: { disabled: true } },
    }),
  )
  .use(api)
  .listen(PORT);

logger.info(
  `Server is running at ${app.server?.hostname}:${app.server?.port}.`,
);

process.on("SIGINT", () => {
  logger.info("Received SIGINT. Stopping...");
  app.stop();
});
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Stopping...");
  app.stop();
});

export type App = typeof app;
