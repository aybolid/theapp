import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_no_auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_no_auth/signin"!</div>;
}
