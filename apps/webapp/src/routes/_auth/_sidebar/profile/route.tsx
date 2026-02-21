import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_sidebar/profile")({
  head: () => ({
    meta: [
      {
        title: "My Profile | theapp",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
