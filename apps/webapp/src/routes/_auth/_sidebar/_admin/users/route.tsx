import {
  createFileRoute,
  type ErrorComponentProps,
  Link,
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
import type { UserResponse } from "@theapp/schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
import { Badge } from "@theapp/ui/components/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import { Alert01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { DataTableSortingOptions } from "@theapp/webapp/components/data-table-sorting-options";
import { DataTableViewOptions } from "@theapp/webapp/components/data-table-view-options";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { SearchInput } from "@theapp/webapp/components/search-input";
import { UserChip } from "@theapp/webapp/components/user-chip";
import { UuidDisplay } from "@theapp/webapp/components/uuid-diplay";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import { useUsersSuspenseQuery } from "@theapp/webapp/lib/query/users";
import dayjs from "dayjs";
import {
  createStandardSchemaV1,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { Suspense, useMemo } from "react";
import z from "zod";

type UserTableEntry = UserResponse & { isMe: boolean };

const searchParams = {
  query: parseAsString.withDefault(""),
  columnVisibility: parseAsJson(z.record(z.string(), z.boolean())).withDefault(
    {},
  ),
  sorting: parseAsJson(z.record(z.string(), z.boolean())).withDefault({
    createdAt: true,
  }),
};

export const Route = createFileRoute("/_auth/_sidebar/_admin/users")({
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const meQuery = useMeSuspenseQuery();
  const usersQuery = useUsersSuspenseQuery();

  const [{ query, columnVisibility, sorting }, setSearchParams] =
    useQueryStates(searchParams);

  const sortingState = useMemo(() => {
    return Object.entries(sorting).map(([id, desc]) => ({ id, desc }));
  }, [sorting]);

  const data = useMemo<UserTableEntry[]>(() => {
    return usersQuery.data.map((user) => ({
      ...user,
      isMe: user.userId === meQuery.data.userId,
    }));
  }, []);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    getRowId: (user) => user.userId,
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
        ...columnVisibility,
      },
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
            userId: "ID",
            role: "Role",
            profile_name: "Name",
            email: "Email",
            createdAt: "Member since",
          }}
        />
        <DataTableViewOptions
          table={table}
          variant="outline"
          labelsMap={{
            userId: "ID",
            role: "Role",
            profile_name: "Name",
            email: "Email",
            createdAt: "Member since",
          }}
        />
        <div className="flex-1" />
      </div>
      <DataTable
        table={table}
        caption={
          <span>
            See{" "}
            <Link className="text-primary underline" to="/invites">
              invites page
            </Link>{" "}
            to add new users.
          </span>
        }
      />
    </div>
  );
}

const helper = createColumnHelper<UserTableEntry>();

const COLUMNS = [
  helper.accessor("userId", {
    enableHiding: false,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: (props) => {
      return <UuidDisplay uuid={props.getValue()} />;
    },
  }),
  helper.display({
    id: "link",
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Page link" />
    ),
    cell: (props) => {
      return <UserChip user={props.row.original} />;
    },
  }),
  helper.accessor("role", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: (props) => {
      return props.getValue() === "admin" ? (
        <Badge>Admin</Badge>
      ) : (
        <Badge variant="secondary">Viewer</Badge>
      );
    },
  }),
  helper.accessor("profile.name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: (props) => <span className="font-medium">{props.getValue()}</span>,
  }),
  helper.accessor("email", {
    enableHiding: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  }),
  helper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member since" />
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
        <EmptyTitle>Loading users...</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        <AlertTitle>Couldn't load the users</AlertTitle>
        <AlertDescription>
          Something broke. Give it another shot in a bit.
        </AlertDescription>
      </Alert>
      <Suspense>
        <LazyDevErrorStackDisplay error={error} />
      </Suspense>
    </div>
  );
}
