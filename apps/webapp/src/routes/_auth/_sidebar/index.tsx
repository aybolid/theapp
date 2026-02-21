import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_sidebar/")({
  head: () => ({
    meta: [
      {
        title: "theapp",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
