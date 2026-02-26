import openapi from "@elysiajs/openapi";
import { auth } from "@theapp/server/modules/auth";
import { profiles } from "@theapp/server/modules/profiles";
import { Elysia } from "elysia";
import z from "zod";
import { checkEnv } from "./env";
import { misc } from "./modules/misc";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";

checkEnv();

const PORT = 8080;

const api = new Elysia({ prefix: "/api" })
  .use(auth)
  .use(profiles)
  .use(wishes)
  .use(misc)
  .use(users);

const app = new Elysia()
  .onError((ctx) => {
    console.error(ctx.code, ctx.error);
  })
  .use(
    openapi({
      mapJsonSchema: { zod: z.toJSONSchema },
      scalar: { agent: { disabled: true } },
    }),
  )
  .use(api)
  .listen(PORT);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
