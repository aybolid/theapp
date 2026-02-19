import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@theapp/ui/components/button";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { UserAccountDialog } from "@theapp/webapp/components/user-account-dialog";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <UserAccountDialog>
        <Button>Hello</Button>
      </UserAccountDialog>
      <ThemeMenu />
    </>
  );
}
