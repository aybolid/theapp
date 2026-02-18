import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meQueryOptions } from "../lib/query/auth";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async (ctx) => {
    const user = await ctx.context.queryClient
      .fetchQuery(meQueryOptions)
      .catch(() => null);
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
