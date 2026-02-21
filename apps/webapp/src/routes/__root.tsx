import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  },
);

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <TanStackDevtools
        plugins={[
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
            defaultOpen: false,
          },
          formDevtoolsPlugin(),
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
            defaultOpen: false,
          },
        ]}
      />
    </>
  );
}
