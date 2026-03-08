import { createFileRoute, Outlet } from "@tanstack/react-router";
import { beforeLoadAccessGuard } from "@theapp/webapp/lib/utils";

export const Route = createFileRoute("/_auth/_sidebar/_admin")({
  beforeLoad: async (ctx) => {
    await beforeLoadAccessGuard(ctx.context.queryClient, ["admin"]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
