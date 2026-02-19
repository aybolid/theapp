import openapi from "@elysiajs/openapi";
import { auth } from "@theapp/server/modules/auth";
import { profiles } from "@theapp/server/modules/profiles";
import { Elysia } from "elysia";
import z from "zod";

const PORT = 8080;

const api = new Elysia({ prefix: "/api" }).use(auth).use(profiles);

const app = new Elysia()
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
