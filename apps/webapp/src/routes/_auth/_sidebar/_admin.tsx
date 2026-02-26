import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { meQueryOptions } from "@theapp/webapp/lib/query/auth";

export const Route = createFileRoute("/_auth/_sidebar/_admin")({
  beforeLoad: async (ctx) => {
    const user =
      ctx.context.queryClient.getQueryData(meQueryOptions.queryKey) ??
      (await ctx.context.queryClient
        .fetchQuery(meQueryOptions)
        .catch(() => null));
    if (!user || user.role !== "admin") {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
