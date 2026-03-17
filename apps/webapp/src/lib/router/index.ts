import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@theapp/webapp/routeTree.gen";
import { queryClient } from "../query/index";

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  notFoundMode: "root",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
