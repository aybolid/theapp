import { useQueryClient } from "@tanstack/react-query";
import type { WishResponse } from "@theapp/schemas";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@theapp/ui/components/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import { EllipsisVertical, ExternalLink } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import { LinkPreview } from "@theapp/webapp/components/link-preview";
import { UserChip } from "@theapp/webapp/components/user-chip";
import {
  useUpdateWishReservationMutation,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import dayjs from "dayjs";
import type { FC } from "react";
import { WishActionsMenu } from "./wish-actions-menu";

export const WishItem: FC<{
  wish: WishResponse;
  isOwnedByMe: boolean;
  isReservedByMe: boolean;
}> = ({ wish, isOwnedByMe, isReservedByMe }) => {
  let linkLabel = "Follow link";
  try {
    linkLabel = new URL(wish.link).hostname;
  } catch {}

  const queryClient = useQueryClient();

  const updateReservationMutation = useUpdateWishReservationMutation({
    onSuccess: (wish) => {
      queryClient.setQueryData<WishResponse[]>(
        wishesQueryOptions.queryKey,
        (prev) => prev?.map((w) => (w.wishId === wish.wishId ? wish : w)),
      );
      queryClient.invalidateQueries({
        queryKey: wishesQueryOptions.queryKey,
      });
    },
    onError: () => toast.error("Failed to reserve wish"),
  });

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>{wish.name}</span>
          {wish.isCompleted ? (
            <Badge>Completed</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </CardTitle>
        {wish.note && <CardDescription>{wish.note}</CardDescription>}
        <CardAction>
          <WishActionsMenu
            wish={wish}
            isOwnedByMe={isOwnedByMe}
            isReservedByMe={isReservedByMe}
            render={
              <Button size="icon" variant="secondary">
                <HugeiconsIcon icon={EllipsisVertical} strokeWidth={2} />
              </Button>
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <div className="flex-1" />
        <ItemGroup className="grid gap-2 sm:grid-cols-2">
          <Item variant="muted" className="items-start">
            <ItemContent>
              <ItemTitle>Owner</ItemTitle>
              <UserChip user={wish.owner} />
            </ItemContent>
          </Item>
          <Item variant="muted" className="items-start">
            <ItemContent>
              <ItemTitle>Reserver</ItemTitle>
              {wish.reserver ? (
                <UserChip user={wish.reserver} />
              ) : isOwnedByMe ? (
                <ItemDescription>No reserver</ItemDescription>
              ) : (
                <Button
                  disabled={updateReservationMutation.isPending}
                  onClick={() =>
                    updateReservationMutation.mutate({
                      wishId: wish.wishId,
                      action: "start",
                    })
                  }
                >
                  {updateReservationMutation.isPending && <Spinner />}
                  <span>Reserve</span>
                </Button>
              )}
            </ItemContent>
          </Item>
          <Item variant="muted" className="justify-between">
            <ItemTitle>Created at</ItemTitle>
            <ItemDescription>
              {dayjs(wish.createdAt).format("MMM DD, YYYY, HH:mm")}
            </ItemDescription>
          </Item>
          <Item variant="muted" className="justify-between">
            <ItemTitle>Updated at</ItemTitle>
            <ItemDescription>
              {dayjs(wish.updatedAt).format("MMM DD, YYYY, HH:mm")}
            </ItemDescription>
          </Item>
        </ItemGroup>
      </CardContent>
      <CardFooter>
        <LinkPreview
          url={wish.link}
          render={
            <Button
              className="w-full"
              nativeButton={false}
              variant="link"
              render={
                <a href={wish.link} target="_blank">
                  <HugeiconsIcon icon={ExternalLink} strokeWidth={2} />
                  <span>{linkLabel}</span>
                </a>
              }
            />
          }
        />
      </CardFooter>
    </Card>
  );
};
