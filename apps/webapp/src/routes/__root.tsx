import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  type ErrorComponentProps,
  HeadContent,
  Link,
  type NotFoundRouteProps,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Button } from "@theapp/ui/components/button";
import { Home01Icon, RefreshIcon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { Suspense } from "react";
import { LazyDevErrorStackDisplay } from "../components/lazy";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootComponent() {
  return (
    <>
      <HeadContent />
      <NuqsAdapter>
        <Outlet />
      </NuqsAdapter>
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

function NotFoundComponent(_: NotFoundRouteProps) {
  return (
    <div className="grid h-screen place-items-center p-4">
      <div>
        <h1 className="font-semibold text-2xl">404</h1>
        <p className="pb-4">This page could not be found.</p>
        <Button
          nativeButton={false}
          variant="secondary"
          render={
            <Link to="/">
              <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
              <span>Go home</span>
            </Link>
          }
        />
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="grid h-screen place-items-center p-4">
      <div>
        <h1 className="font-semibold text-2xl text-destructive">
          Something went wrong!
        </h1>
        <p className="pb-4">An unexpected error occurred.</p>
        <Button onClick={reset} variant="secondary">
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
          <span>Try again</span>
        </Button>
        <Suspense>
          <LazyDevErrorStackDisplay error={error} className="mt-6" />
        </Suspense>
      </div>
    </div>
  );
}
