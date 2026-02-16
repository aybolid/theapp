import { Elysia } from "elysia";

const PORT = 8080;

const app = new Elysia().get("/", () => "Hello Elysia").listen(PORT);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
