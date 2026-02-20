import { createFileRoute } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@theapp/ui/components/sidebar";
import { AppSidebar } from "@theapp/webapp/components/app-sidebar";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";

export const Route = createFileRoute("/_auth/")({
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
        <main className="p-4 pt-0"></main>
      </SidebarInset>
    </SidebarProvider>
  );
}
