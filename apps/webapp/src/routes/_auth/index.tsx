import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@theapp/ui/components/button";
import { UserDialog } from "@theapp/webapp/components/user-dialog";

export const Route = createFileRoute("/_auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserDialog>
      <Button>Hello</Button>
    </UserDialog>
  );
}
