import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_no_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
