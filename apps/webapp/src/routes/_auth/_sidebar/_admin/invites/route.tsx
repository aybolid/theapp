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
import { Button } from "@theapp/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import { Alert01Icon, UserPlus } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { DataTableSortingOptions } from "@theapp/webapp/components/data-table-sorting-options";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { SearchInput } from "@theapp/webapp/components/search-input";
import { UuidDisplay } from "@theapp/webapp/components/uuid-diplay";
import { useInvitesSuspenseQuery } from "@theapp/webapp/lib/query/invites";
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
        caption="Do not bother deleting expired invites. They will be automatically deleted."
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
    cell: () => null,
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
        <AlertTitle>Invites loading failed</AlertTitle>
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
