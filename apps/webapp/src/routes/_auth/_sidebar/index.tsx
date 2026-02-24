import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Gift } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";

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
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <h1 className="font-bold text-2xl">Welcome to THEAPP.</h1>
      <p className="text-muted-foreground">
        A suite of tools created to simplify your daily routine. Explore
        available applications below.
      </p>
      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/wishes">
          <Item variant="muted">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Gift} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Wishes</ItemTitle>
              <ItemDescription className="line-clamp-none">
                Create and share wishes with ease. Take the guesswork out of
                gifting for birthdays and special occasions.
              </ItemDescription>
            </ItemContent>
          </Item>
        </Link>
      </section>
    </div>
  );
}
