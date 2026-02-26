import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import type { WishResponse } from "@theapp/schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@theapp/ui/components/toggle-group";
import { useIsMobile } from "@theapp/ui/hooks/use-mobile";
import {
  Alert01Icon,
  Cards01Icon,
  EllipsisVertical,
  ExternalLink,
  ListViewIcon,
  PlusSignIcon,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { DataTableSortingOptions } from "@theapp/webapp/components/data-table-sorting-options";
import { DataTableViewOptions } from "@theapp/webapp/components/data-table-view-options";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { LinkPreview } from "@theapp/webapp/components/link-preview";
import { SearchInput } from "@theapp/webapp/components/search-input";
import { UserChip } from "@theapp/webapp/components/user-chip";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import {
  useUpdateWishReservationMutation,
  useWishesSuspenseQuery,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import dayjs from "dayjs";
import {
  createStandardSchemaV1,
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { Activity, lazy, Suspense, useMemo } from "react";
import z from "zod";
import { EmptyFilteredWishes, EmptyWishes } from "./-components/empty-wishes";
import { WishActionsMenu } from "./-components/wish-actions-menu";
import { WishItem } from "./-components/wish-item";

const LazyNewWishDialog = lazy(() =>
  import("./-components/new-wish-dialog").then((m) => ({
    default: m.NewWishDialog,
  })),
);

const searchParams = {
  query: parseAsString.withDefault(""),
  view: parseAsStringLiteral(["table", "cards"]).withDefault("table"),
  columnVisibility: parseAsJson(z.record(z.string(), z.boolean())).withDefault({
    createdAt: false,
    updatedAt: false,
  }),
  sorting: parseAsJson(z.record(z.string(), z.boolean())).withDefault({
    createdAt: true,
  }),
};

export const Route = createFileRoute("/_auth/_sidebar/wishes")({
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

type WishTableEntry = WishResponse & {
  isOwnedByMe: boolean;
  isReservedByMe: boolean;
};

function RouteComponent() {
  const isMobile = useIsMobile();
  const [{ query, view, columnVisibility, sorting }, setSearchParams] =
    useQueryStates(searchParams);

  const meQuery = useMeSuspenseQuery();
  const wishesQuery = useWishesSuspenseQuery();

  const data: WishTableEntry[] = useMemo(
    () =>
      wishesQuery.data.map((wish) => ({
        ...wish,
        isOwnedByMe: meQuery.data.userId === wish.ownerId,
        isReservedByMe: meQuery.data.userId === wish.reserverId,
      })),
    [wishesQuery.data],
  );

  const sortingState = useMemo(() => {
    return Object.entries(sorting).map(([id, desc]) => ({ id, desc }));
  }, [sorting]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: (updater) => {
      let value: VisibilityState;
      if (typeof updater === "function") {
        value = updater(columnVisibility);
      } else {
        value = updater;
      }
      setSearchParams({ columnVisibility: value });
    },
    onSortingChange: (updater) => {
      let value: SortingState;
      if (typeof updater === "function") {
        value = updater([]);
      } else {
        value = updater;
      }
      setSearchParams({
        sorting: Object.fromEntries(value.map(({ id, desc }) => [id, desc])),
      });
    },
    state: {
      columnVisibility: {
        "owner.userId": false,
        "owner.email": false,
        "reserver.userId": false,
        "reserver.email": false,
        ...columnVisibility,
      },
      sorting: sortingState,
      globalFilter: query || undefined,
    },
  });

  const tableWishes = table.getRowModel().rows.map((r) => r.original);

  if (wishesQuery.data.length === 0) {
    return <EmptyWishes className="size-full" />;
  }

  return (
    <div className="flex h-full flex-col">
      <Activity mode={isMobile ? "hidden" : "visible"}>
        <div className="sticky top-0 z-50 flex flex-wrap gap-2 bg-background py-4 outline outline-background">
          <SearchInput
            className="w-80"
            defaultValue={query}
            onDebouncedChange={(v) => setSearchParams({ query: v })}
          />
          <ToggleGroup
            variant="outline"
            multiple={false}
            value={[view]}
            onValueChange={(v) =>
              setSearchParams({ view: searchParams.view.parse(v[0] ?? "") })
            }
          >
            <ToggleGroupItem value="table">
              <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} />
            </ToggleGroupItem>
            <ToggleGroupItem value="cards">
              <HugeiconsIcon icon={Cards01Icon} strokeWidth={2} />
            </ToggleGroupItem>
          </ToggleGroup>
          <DataTableSortingOptions
            table={table}
            variant="outline"
            labelsMap={{
              isCompleted: "Status",
              note: "Note",
              createdAt: "Created at",
              updatedAt: "Updated at",
              owner_profile_name: "Owner",
              reserver_profile_name: "Reserver",
              name: "Name",
            }}
          />
          {view === "table" && (
            <DataTableViewOptions
              table={table}
              variant="outline"
              labelsMap={{
                isCompleted: "Status",
                note: "Note",
                createdAt: "Created at",
                updatedAt: "Updated at",
              }}
            />
          )}
          <div className="flex-1" />
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
        </div>
        <Activity mode={view === "table" ? "visible" : "hidden"}>
          <DataTable table={table} />
        </Activity>
        <Activity mode={view === "cards" ? "visible" : "hidden"}>
          {tableWishes.length ? (
            <div className="grid gap-4 pt-0.5 xl:grid-cols-2 2xl:grid-cols-3">
              {tableWishes.map((wish) => (
                <WishItem
                  key={wish.wishId}
                  wish={wish}
                  isOwnedByMe={wish.isOwnedByMe}
                  isReservedByMe={wish.isReservedByMe}
                />
              ))}
            </div>
          ) : (
            <EmptyFilteredWishes />
          )}
        </Activity>
      </Activity>
      <Activity mode={isMobile ? "visible" : "hidden"}>
        {tableWishes.length ? (
          <div className="flex-1">
            <div className="grid gap-4">
              {tableWishes.map((wish) => (
                <WishItem
                  key={wish.wishId}
                  wish={wish}
                  isOwnedByMe={wish.isOwnedByMe}
                  isReservedByMe={wish.isReservedByMe}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyFilteredWishes />
        )}
        <div className="sticky bottom-4 z-20 mt-4 flex h-fit w-full items-center gap-2 rounded-lg border bg-background p-2">
          <SearchInput
            defaultValue={query}
            onDebouncedChange={(v) => setSearchParams({ query: v })}
          />
          <DataTableSortingOptions
            className="bg-background!"
            onlyIcon
            table={table}
            variant="outline"
            labelsMap={{
              isCompleted: "Status",
              note: "Note",
              createdAt: "Created at",
              updatedAt: "Updated at",
              owner_profile_name: "Owner",
              reserver_profile_name: "Reserver",
              name: "Name",
            }}
          />
          <Suspense
            fallback={
              <Button size="icon" disabled>
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              </Button>
            }
          >
            <LazyNewWishDialog
              render={
                <Button size="icon">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                </Button>
              }
            />
          </Suspense>
        </div>
      </Activity>
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

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        <AlertTitle>Wishes loading failed</AlertTitle>
        <AlertDescription>
          Some unexpected error occurred. Please try again later.
        </AlertDescription>
      </Alert>
      <Suspense>
        <LazyDevErrorStackDisplay error={error} />
      </Suspense>
    </div>
  );
}

const helper = createColumnHelper<WishTableEntry>();

const COLUMNS = [
  helper.accessor("owner.profile.name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    enableHiding: false,
    cell: (props) => {
      const owner = props.row.original.owner;
      return <UserChip user={owner} />;
    },
  }),
  helper.accessor("owner.userId", {
    id: "owner.userId",
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
  }),
  helper.accessor("owner.email", {
    id: "owner.email",
    enableHiding: false,
    enableSorting: false,
  }),
  helper.accessor("isCompleted", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableGlobalFilter: false,
    cell: (props) =>
      props.getValue() ? (
        <Badge>Completed</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  }),
  helper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableHiding: false,
    cell: (props) => (
      <p className="w-72 text-wrap font-medium">{props.getValue()}</p>
    ),
  }),
  helper.accessor("note", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Note" />
    ),
    cell: (props) => (
      <p className="w-72 text-wrap text-muted-foreground text-sm">
        {props.getValue()}
      </p>
    ),
  }),
  helper.accessor("link", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Link" />
    ),
    enableSorting: false,
    enableHiding: false,
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
  helper.accessor("reserver.profile.name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reserver" />
    ),
    enableHiding: false,
    cell: (props) => {
      const reserver = props.row.original.reserver;

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

      if (!reserver) {
        if (!props.row.original.isOwnedByMe) {
          return (
            <Button
              size="xs"
              disabled={updateReservationMutation.isPending}
              onClick={() => {
                updateReservationMutation.mutate({
                  wishId: props.row.original.wishId,
                  action: "start",
                });
              }}
            >
              {updateReservationMutation.isPending && <Spinner />}
              <span>Reserve</span>
            </Button>
          );
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
    enableGlobalFilter: false,
    enableHiding: false,
    enableSorting: false,
    id: "reserver.userId",
  }),
  helper.accessor("reserver.email", {
    id: "reserver.email",
    enableHiding: false,
    enableSorting: false,
  }),
  helper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    enableGlobalFilter: false,
    cell: (props) => (
      <span className="text-muted-foreground text-sm">
        {dayjs(props.getValue()).format("MMM DD, YYYY, HH:mm")}
      </span>
    ),
  }),
  helper.accessor("updatedAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated at" />
    ),
    enableGlobalFilter: false,
    cell: (props) => (
      <span className="text-muted-foreground text-sm">
        {dayjs(props.getValue()).format("MMM DD, YYYY, HH:mm")}
      </span>
    ),
  }),
  helper.display({
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    enableGlobalFilter: false,
    cell: (props) => {
      const wish = props.row.original;
      return (
        <WishActionsMenu
          wish={wish}
          isOwnedByMe={wish.isOwnedByMe}
          isReservedByMe={wish.isReservedByMe}
          render={
            <Button size="icon" variant="secondary">
              <HugeiconsIcon icon={EllipsisVertical} strokeWidth={2} />
            </Button>
          }
        />
      );
    },
  }),
];
