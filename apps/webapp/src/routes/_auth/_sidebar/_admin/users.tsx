import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_sidebar/_admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_auth/_sidebar/_admin/users"!</div>;
}
