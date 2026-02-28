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
} from "@tanstack/react-table";
import type { InviteResponse } from "@theapp/schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
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
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Alert01Icon,
  EllipsisVertical,
  UserPlus,
  X,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { DataTableSortingOptions } from "@theapp/webapp/components/data-table-sorting-options";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { SearchInput } from "@theapp/webapp/components/search-input";
import { UuidDisplay } from "@theapp/webapp/components/uuid-diplay";
import {
  invitesQueryOptions,
  useInvitesSuspenseQuery,
  useRevokeInviteMutation,
} from "@theapp/webapp/lib/query/invites";
import dayjs from "dayjs";
import {
  createStandardSchemaV1,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { lazy, Suspense, useMemo } from "react";
import z from "zod";

const LazyInviteUserDialog = lazy(() =>
  import("./-components/invite-user-dialog").then(({ InviteUserDialog }) => ({
    default: InviteUserDialog,
  })),
);

const searchParams = {
  query: parseAsString.withDefault(""),
  sorting: parseAsJson(z.record(z.string(), z.boolean())).withDefault({
    createdAt: true,
  }),
};

export const Route = createFileRoute("/_auth/_sidebar/_admin/invites")({
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const invitesQuery = useInvitesSuspenseQuery();

  const [{ query, sorting }, setSearchParams] = useQueryStates(searchParams);

  const sortingState = useMemo(() => {
    return Object.entries(sorting).map(([id, desc]) => ({ id, desc }));
  }, [sorting]);

  const table = useReactTable({
    data: invitesQuery.data,
    columns: COLUMNS,
    getRowId: (invite) => invite.inviteId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      sorting: sortingState,
      globalFilter: query || undefined,
    },
  });

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-50 flex flex-wrap gap-2 bg-background py-4 outline outline-background">
        <SearchInput
          className="w-80"
          defaultValue={query}
          onDebouncedChange={(v) => setSearchParams({ query: v })}
        />
        <DataTableSortingOptions
          table={table}
          variant="outline"
          labelsMap={{
            email: "Email",
            createdAt: "Sent at",
            expiresAt: "Expires at",
          }}
        />

        <div className="flex-1" />

        <Suspense
          fallback={
            <Button disabled>
              <HugeiconsIcon icon={UserPlus} strokeWidth={2} />
              <span>Invite user</span>
            </Button>
          }
        >
          <LazyInviteUserDialog
            render={
              <Button>
                <HugeiconsIcon icon={UserPlus} strokeWidth={2} />
                <span>Invite user</span>
              </Button>
            }
          />
        </Suspense>
      </div>
      <DataTable
        table={table}
        caption="Don't worry about old invites. They'll disappear on their own."
      />
    </div>
  );
}

const helper = createColumnHelper<InviteResponse>();

const COLUMNS = [
  helper.accessor("inviteId", {
    enableHiding: false,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: (props) => {
      return <UuidDisplay uuid={props.getValue()} />;
    },
  }),
  helper.accessor("email", {
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  }),
  helper.accessor("createdAt", {
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sent at" />
    ),
    cell: (props) => (
      <span className="text-muted-foreground text-sm">
        {dayjs(props.getValue()).format("MMM DD, YYYY, HH:mm")}
      </span>
    ),
  }),
  helper.accessor("expiresAt", {
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expires at" />
    ),
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
    cell: (props) => {
      const invite = props.row.original;

      const queryClient = useQueryClient();

      const revokeMutation = useRevokeInviteMutation({
        onSuccess: (_, { inviteId }) => {
          queryClient.setQueryData(invitesQueryOptions.queryKey, (prev) =>
            prev?.filter((i) => i.inviteId !== inviteId),
          );
          queryClient.invalidateQueries({
            queryKey: invitesQueryOptions.queryKey,
          });
        },
        onError: () => {
          toast.error("Couldn't revoke invite");
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="secondary">
                <HugeiconsIcon icon={EllipsisVertical} strokeWidth={2} />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <AlertDialog>
                <AlertDialogTrigger
                  nativeButton={false}
                  render={
                    <DropdownMenuItem
                      variant="destructive"
                      closeOnClick={false}
                      disabled={revokeMutation.isPending}
                    >
                      <HugeiconsIcon icon={X} strokeWidth={2} />
                      <span>Revoke invite</span>
                    </DropdownMenuItem>
                  }
                />
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will revoke the invite. The invite will be
                      removed from the list and user will no longer be able to
                      accept it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogCancel
                      render={
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() =>
                            revokeMutation.mutate({
                              inviteId: invite.inviteId,
                            })
                          }
                        >
                          Continue
                        </AlertDialogAction>
                      }
                    />
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

function PendingComponent() {
  return (
    <Empty className="size-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading invites</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        <AlertTitle>Couldn't load invites</AlertTitle>
        <AlertDescription>
          Something's broken. Give it another shot?
        </AlertDescription>
      </Alert>
      <Suspense>
        <LazyDevErrorStackDisplay error={error} />
      </Suspense>
    </div>
  );
}
