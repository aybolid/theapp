import {
  QueryErrorResetBoundary,
  useSuspenseQueries,
} from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { F1Driver, F1DriverChampionshipStanding } from "@theapp/schemas";
import {
  Alert,
  AlertAction,
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
import { Alert01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import {
  f1DriverChampionshipStandingsQueryOptions,
  f1SessionDriversQueryOptions,
} from "@theapp/webapp/lib/query/f1";
import { type FC, Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DriverChip } from "../-components/driver-chip";

export const DriverStandingsTab: FC = () => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="container mx-auto grid max-w-3xl gap-4 p-4">
              <Alert variant="destructive">
                <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
                <AlertTitle>Couldn't load driver standings</AlertTitle>
                <AlertDescription>
                  Something went wrong. Maybe try again?
                </AlertDescription>
                <AlertAction>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={resetErrorBoundary}
                  >
                    Try again
                  </Button>
                </AlertAction>
              </Alert>
              <Suspense>
                <LazyDevErrorStackDisplay error={error as Error} />
              </Suspense>
            </div>
          )}
        >
          <Suspense
            fallback={
              <Empty className="size-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Pit stop...</EmptyTitle>
                </EmptyHeader>
              </Empty>
            }
          >
            <DriverStandingsTabImpl />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

type DriverStandingTableEntry = F1DriverChampionshipStanding & {
  driver: F1Driver;
};

const DriverStandingsTabImpl: FC = () => {
  const [standingsQuery, driversQuery] = useSuspenseQueries({
    queries: [
      f1DriverChampionshipStandingsQueryOptions,
      f1SessionDriversQueryOptions({ sessionKey: "latest" }),
    ],
  });

  const driversMap = useMemo(() => {
    return driversQuery.data.reduce<
      Record<F1Driver["driver_number"], F1Driver>
    >((acc, curr) => {
      acc[curr.driver_number] = curr;
      return acc;
    }, {});
  }, [driversQuery.data]);

  const data = useMemo(() => {
    return standingsQuery.data.map((result) => {
      const driver = driversMap[result.driver_number];
      if (!driver)
        throw new Error(
          `No driver found for driver_number: ${result.driver_number}`,
        );
      return {
        ...result,
        driver,
      };
    });
  }, [driversMap, standingsQuery.data]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
};

const helper = createColumnHelper<DriverStandingTableEntry>();

const COLUMNS = [
  helper.accessor("position_current", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: (props) => {
      const position = props.getValue();

      if (position === null) {
        return (
          <span className="font-mono text-lg text-muted-foreground">??</span>
        );
      }

      return (
        <span
          className={cn("text font-mono font-semibold text-lg", {
            "text-primary": position <= 3,
          })}
        >
          {position.toString().padStart(2, "0")}
        </span>
      );
    },
  }),
  helper.accessor("driver", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driver" />
    ),
    cell: (props) => {
      const driver = props.row.original.driver;
      return <DriverChip driver={driver} />;
    },
  }),
  helper.accessor("points_current", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
    cell: (props) => {
      const points = props.getValue() ?? 0;

      const diff = points - (props.row.original.points_start ?? 0);

      return (
        <span
          className={cn("text font-mono font-semibold text-lg", {
            "text-destructive": points === 0,
          })}
        >
          {points ?? "??"}{" "}
          {diff !== 0 && (
            <span className="text-muted-foreground text-xs">+{diff}</span>
          )}
        </span>
      );
    },
  }),
];
