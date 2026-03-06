import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@theapp/ui/components/item";
import { ChampionIcon, Gift } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { PageWrapper } from "../-components/page-wrapper";

export const Route = createFileRoute("/_auth/_sidebar/")({
  head: () => ({
    meta: [{ title: "THEAPP" }],
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
                  Share what you're wishing for and see what others want.
                </ItemDescription>
              </ItemContent>
            </Item>
          </Link>
          <Link to="/f1">
            <Item variant="muted" className="hover:bg-muted">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={ChampionIcon} strokeWidth={2} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Formula 1</ItemTitle>
                <ItemDescription className="line-clamp-none">
                  Track current Formula 1 season progress and results.
                </ItemDescription>
              </ItemContent>
            </Item>
          </Link>
        </section>
      </div>
    </PageWrapper>
  );
}
