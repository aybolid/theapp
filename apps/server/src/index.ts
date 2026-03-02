import openapi from "@elysiajs/openapi";
import { auth } from "@theapp/server/modules/auth";
import { profiles } from "@theapp/server/modules/profiles";
import { Elysia } from "elysia";
import z from "zod";
import { checkEnv } from "./env";
import { invites } from "./modules/invites";
import { misc } from "./modules/misc";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";
import { logger } from "./utils/logger";

checkEnv();

const PORT = 3000;

const api = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(profiles)
  .use(wishes)
  .use(misc)
  .use(users)
  .use(invites);

const app = new Elysia()
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
      mapJsonSchema: { zod: z.toJSONSchema },
      scalar: { agent: { disabled: true } },
    }),
  )
  .use(api)
  .listen(PORT);

logger.info(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
