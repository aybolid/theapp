import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@theapp/ui/components/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Chat01Icon, Gift } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { PageWrapper } from "../-components/page-wrapper";

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
    <PageWrapper>
      <div className="container mx-auto grid max-w-3xl gap-4">
        <h1 className="font-bold text-2xl">Welcome!</h1>
        <p className="text-muted-foreground">
          Just a few tools to make our lives a bit easier. Pick something below
          and get started.
        </p>
        <section className="grid gap-4 md:grid-cols-2">
          <Link to="/wishes">
            <Item variant="muted" className="hover:bg-muted">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={Gift} strokeWidth={2} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Wishes</ItemTitle>
                <ItemDescription className="line-clamp-none">
                  Share what you're wishing for and see what others want. No
                  more awkward "what do you want for your birthday?" talks.
                </ItemDescription>
              </ItemContent>
            </Item>
          </Link>
          <Item variant="muted" className="opacity-50">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Chat01Icon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <span>Quotes</span>
                <Badge variant="secondary">Work in progress</Badge>
              </ItemTitle>
              <ItemDescription className="line-clamp-none">
                Someone said something wild? Write it down! Nothing beats
                reading it later, completely out of context.
              </ItemDescription>
            </ItemContent>
          </Item>
        </section>
      </div>
    </PageWrapper>
  );
}
