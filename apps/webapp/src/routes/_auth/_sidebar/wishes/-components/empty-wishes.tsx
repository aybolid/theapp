import { Button } from "@theapp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Gift, PlusSignIcon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { type ComponentPropsWithoutRef, type FC, lazy, Suspense } from "react";

const LazyNewWishDialog = lazy(() =>
  import("./new-wish-dialog").then((m) => ({
    default: m.NewWishDialog,
  })),
);

export const EmptyWishes: FC<ComponentPropsWithoutRef<typeof Empty>> = (
  props,
) => {
  return (
    <Empty {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Gift} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No wishes yet</EmptyTitle>
        <EmptyContent>
          <Suspense
            fallback={
              <Button disabled>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                <span>New wish</span>
              </Button>
            }
          >
            <LazyNewWishDialog
              render={
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  <span>New wish</span>
                </Button>
              }
            />
          </Suspense>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
};

export const EmptyFilteredWishes: FC<ComponentPropsWithoutRef<typeof Empty>> = (
  props,
) => {
  return (
    <Empty {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Gift} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No wishes found</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
};
