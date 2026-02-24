import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import type { WishResponse } from "@theapp/schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@theapp/ui/components/alert-dialog";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Delete01Icon,
  Edit01Icon,
  EllipsisVertical,
  ExternalLink,
  Gift,
  PlusSignIcon,
  Tick01Icon,
  X,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { DataTable } from "@theapp/webapp/components/data-table";
import { LinkPreview } from "@theapp/webapp/components/link-preview";
import { UserChip } from "@theapp/webapp/components/user-chip";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import {
  useDeleteWishMutation,
  useWishesSuspenseQuery,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import dayjs from "dayjs";
import { lazy, Suspense } from "react";

const LazyNewWishDialog = lazy(() =>
  import("./-components/new-wish-dialog").then((m) => ({
    default: m.NewWishDialog,
  })),
);

export const Route = createFileRoute("/_auth/_sidebar/wishes")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

const helper = createColumnHelper<
  WishResponse & { isOwnedByMe: boolean; isReservedByMe: boolean }
>();

const COLUMNS = [
  helper.accessor("owner", {
    header: "Owner",
    cell: (props) => {
      const owner = props.getValue();
      return <UserChip user={owner} />;
    },
  }),
  helper.accessor("owner.userId", {
    id: "owner.userId",
  }),
  helper.accessor("isCompleted", {
    header: "Status",
    cell: (props) =>
      props.getValue() ? (
        <Badge>Completed</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  }),
  helper.accessor("name", {
    header: "Name",
    cell: (props) => (
      <span className="w-72 text-wrap font-medium transition-all">
        {props.getValue()}
      </span>
    ),
  }),
  helper.accessor("note", {
    header: "Note",
    cell: (props) => (
      <p className="w-72 text-wrap text-muted-foreground text-sm transition-all">
        {props.getValue()}
      </p>
    ),
  }),
  helper.accessor("link", {
    header: "Link",
    cell: (props) => {
      const url = props.getValue();

      let label = "Follow link";
      try {
        label = new URL(url).hostname;
      } catch {}

      return (
        <LinkPreview
          url={url}
          render={
            <Button
              nativeButton={false}
              variant="link"
              size="xs"
              render={
                <a href={url} target="_blank">
                  <HugeiconsIcon icon={ExternalLink} strokeWidth={2} />
                  <span>{label}</span>
                </a>
              }
            />
          }
        />
      );
    },
  }),
  helper.accessor("reserver", {
    header: "Reserver",
    cell: (props) => {
      const reserver = props.getValue();

      if (!reserver) {
        if (!props.row.original.isOwnedByMe) {
          return <Button size="xs">Reserve</Button>;
        } else {
          return (
            <span className="text-muted-foreground text-sm">No reserver</span>
          );
        }
      }

      return <UserChip user={reserver} />;
    },
  }),
  helper.accessor("reserver.userId", {
    id: "reserver.userId",
  }),
  helper.accessor("createdAt", {
    header: "Created at",
    cell: (props) => (
      <span className="text-muted-foreground text-sm">
        {dayjs(props.getValue()).format("MMM DD, YYYY, HH:mm")}
      </span>
    ),
  }),
  helper.display({
    header: "Actions",
    cell: (props) => {
      const queryClient = useQueryClient();
      const deleteMutation = useDeleteWishMutation({
        onSuccess: (_, { wishId }) => {
          queryClient.setQueryData<WishResponse[]>(
            wishesQueryOptions.queryKey,
            (prev) => prev?.filter((w) => w.wishId !== wishId),
          );
          queryClient.invalidateQueries({
            queryKey: wishesQueryOptions.queryKey,
          });
        },
      });

      if (
        !props.row.original.isOwnedByMe &&
        !props.row.original.isReservedByMe
      ) {
        return (
          <span className="text-muted-foreground text-sm">
            No actions available
          </span>
        );
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="ghost">
                <HugeiconsIcon icon={EllipsisVertical} strokeWidth={2} />
              </Button>
            }
          />
          <DropdownMenuContent className="w-64">
            {props.row.original.isOwnedByMe && (
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
                  <span>Edit</span>
                </DropdownMenuItem>{" "}
                {props.row.original.isCompleted ? (
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={X} strokeWidth={2} />
                    <span>Mark as pending</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} />
                    <span>Mark as completed</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger
                    nativeButton={false}
                    render={
                      <DropdownMenuItem
                        variant="destructive"
                        closeOnClick={false}
                        disabled={deleteMutation.isPending}
                      >
                        <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    }
                  />
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your wish.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogCancel
                        render={
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() =>
                              deleteMutation.mutate({
                                wishId: props.row.original.wishId,
                              })
                            }
                          >
                            Delete
                          </AlertDialogAction>
                        }
                      />
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

function RouteComponent() {
  const meQuery = useMeSuspenseQuery();
  const wishesQuery = useWishesSuspenseQuery();

  if (wishesQuery.data.length === 0) {
    return (
      <Empty className="size-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Gift} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No wishes yet</EmptyTitle>
          <EmptyContent>
            <Suspense
              fallback={
                <Button className="ml-auto" disabled>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  <span>New wish</span>
                </Button>
              }
            >
              <LazyNewWishDialog
                render={
                  <Button className="ml-auto">
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
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Suspense
          fallback={
            <Button className="ml-auto" disabled>
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              <span>New wish</span>
            </Button>
          }
        >
          <LazyNewWishDialog
            render={
              <Button className="ml-auto">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                <span>New wish</span>
              </Button>
            }
          />
        </Suspense>
      </div>

      <DataTable
        // @ts-expect-error
        columns={COLUMNS}
        initialColumnVisibility={{
          "owner.userId": false,
          "reserver.userId": false,
        }}
        data={wishesQuery.data.map((wish) => ({
          ...wish,
          isOwnedByMe: meQuery.data.userId === wish.ownerId,
          isReservedByMe: meQuery.data.userId === wish.reserverId,
        }))}
      />
    </div>
  );
}

function PendingComponent() {
  return (
    <Empty className="size-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading wishes</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
