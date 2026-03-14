import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import z from "zod";
import { lifecycleHandler, requestLogger } from "./app";
import { prepareDatabase } from "./db/prepare";
import { checkEnv } from "./env";
import { auth } from "./modules/auth";
import { f1 } from "./modules/f1";
import { misc } from "./modules/misc";
import { profiles } from "./modules/profiles";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";
import { logger } from "./utils/logger";

checkEnv();
await prepareDatabase();

const PORT = 3000;

const api = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(profiles)
  .use(wishes)
  .use(misc)
  .use(users)
  .use(f1);

const app = new Elysia({ allowUnsafeValidationDetails: true })
  .use(lifecycleHandler)
  .use(requestLogger)
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
