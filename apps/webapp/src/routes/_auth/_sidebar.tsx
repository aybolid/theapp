import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@theapp/ui/components/sidebar";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { AppSidebar } from "./-components/app-sidebar";

export const Route = createFileRoute("/_auth/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <ThemeMenu className="ml-auto" />
        </header>
        <main className="size-full p-4 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
