import { Elysia } from "elysia";

const PORT = 8080;

const app = new Elysia({ prefix: "/api" })
  .get("/", (ctx) => ctx.status(200, "Hello Elysia"))
  .listen(PORT);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
