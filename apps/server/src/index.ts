import { auth } from "@theapp/server/modules/auth";
import { echoBodySchema } from "@theapp/server/schemas";
import { Elysia } from "elysia";

const PORT = 8080;

const app = new Elysia({ prefix: "/api" })
  .use(auth)
  .post(
    "/echo",
    (ctx) => {
      return ctx.status(200, ctx.body.message);
    },
    {
      body: echoBodySchema.refine((values) => values.message !== "Hello", {
        error: 'Message cannot be "Hello"',
        path: ["message"],
      }),
    },
  )
  .listen(PORT);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
