import openapi from "@elysiajs/openapi";
import { auth } from "@theapp/server/modules/auth";
import { profiles } from "@theapp/server/modules/profiles";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import z from "zod";
import { pool } from "./db";
import { prepareDatabase } from "./db/prepare";
import { checkEnv } from "./env";
import { misc } from "./modules/misc";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";
import { logger } from "./utils/logger";

checkEnv();

const PORT = 3000;

await prepareDatabase();

const api = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(profiles)
  .use(wishes)
  .use(misc)
  .use(users);

const app = new Elysia({ allowUnsafeValidationDetails: true })
  .on("stop", async () => {
    logger.info("Closing database connection...");
    await pool.end();
    logger.info("Database connection closed.");
    process.exit(0);
  })
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, url: request.url },
      "Incoming request",
    );
  })
  .onAfterResponse(({ request, set }) => {
    logger.info(
      { method: request.method, url: request.url, status: set.status },
      "Response sent",
    );
  })
  .onError((ctx) => {
    if (typeof ctx.code !== "number" && ctx.code !== "VALIDATION") {
      logger.error(
        { code: ctx.code, error: ctx.error, url: ctx.request.url },
        "Request failed",
      );
    } else {
      logger.debug(
        { code: ctx.code, error: ctx.error, url: ctx.request.url },
        "Request failed",
      );
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

logger.info(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

process.on("SIGINT", app.stop);
process.on("SIGTERM", app.stop);

export type App = typeof app;
