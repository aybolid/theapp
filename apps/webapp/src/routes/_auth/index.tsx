import { createFileRoute } from "@tanstack/react-router";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const meQuery = useMeSuspenseQuery();
  return <pre>{JSON.stringify(meQuery.data, null, 2)}</pre>;
}
