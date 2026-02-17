import { treaty } from "@elysiajs/eden";
import type { App } from "@theapp/server";

export const server = treaty<App>(
  import.meta.env.DEV
    ? `${window.location.origin}/server-proxy`
    : import.meta.env.VITE_API_BASE_URL,
);
