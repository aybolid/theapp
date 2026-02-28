import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@theapp/ui/components/sidebar";
import { useState } from "react";
import { AppSidebar } from "./-components/app-sidebar";

export const Route = createFileRoute("/_auth/_sidebar")({
  component: RouteComponent,
});

function RouteComponent() {
  const [open, setOpen] = useState(
    localStorage.getItem("sidebarState") === "open",
  );

  return (
    <SidebarProvider
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        localStorage.setItem("sidebarState", v ? "open" : "closed");
      }}
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
