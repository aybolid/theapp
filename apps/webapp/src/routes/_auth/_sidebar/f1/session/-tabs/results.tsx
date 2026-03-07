import {
  QueryErrorResetBoundary,
  useSuspenseQueries,
} from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { F1Driver, SessionResult } from "@theapp/schemas";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import { Alert01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { DataTable } from "@theapp/webapp/components/data-table";
import { DataTableColumnHeader } from "@theapp/webapp/components/data-table-column-header";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import {
  f1SessionDriversQueryOptions,
  f1SessionResultsQueryOptions,
} from "@theapp/webapp/lib/query/f1";
import { type FC, Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const ResultsTab: FC<{ sessionKey: number; isQualifying: boolean }> = ({
  sessionKey,
  isQualifying,
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="container mx-auto grid max-w-3xl gap-4 p-4">
              <Alert>
                <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
                <AlertTitle>Couldn't load session results</AlertTitle>
                <AlertDescription>
                  Something went wrong. Maybe there is no data at the moment?
                </AlertDescription>
                <AlertAction>
                  <Button
                    variant="outline"
                    size="xs"
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
                  <EmptyTitle>Getting results...</EmptyTitle>
                </EmptyHeader>
              </Empty>
            }
          >
            <ResultsTabImpl
              sessionKey={sessionKey}
              isQualifying={isQualifying}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

type ResultTableEntry = SessionResult & { driver: F1Driver };

const ResultsTabImpl: FC<{ sessionKey: number; isQualifying: boolean }> = ({
  sessionKey,
  isQualifying,
}) => {
  const [driversQuery, resultsQuery] = useSuspenseQueries({
    queries: [
      f1SessionDriversQueryOptions({ sessionKey }),
      f1SessionResultsQueryOptions({ sessionKey }),
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
    return resultsQuery.data.map((result) => {
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
  }, [driversMap, resultsQuery.data]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: isQualifying
        ? {
            gap_to_leader: false,
            duration: false,
          }
        : {
            q1: false,
            q2: false,
            q3: false,
          },
    },
  });

  return <DataTable table={table} />;
};

const helper = createColumnHelper<ResultTableEntry>();

const createQualifyingColumn = (qualifyingRound: number) =>
  helper.display({
    id: `q${qualifyingRound}`,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={`Q${qualifyingRound}`} />
    ),
    cell: (props) => {
      const gap = props.row.original.gap_to_leader;
      const duration = props.row.original.duration;
      if (!Array.isArray(gap) || !Array.isArray(duration)) {
        return;
      }
      const q1Gap = gap[qualifyingRound - 1] ?? null;
      const q1Duration = duration[qualifyingRound - 1] ?? 0;

      if (q1Gap === null) {
        return;
      }

      if (q1Gap === 0) {
        return (
          <span className="font-mono text-lg text-primary">
            {q1Duration.toFixed(3)}
            <span className="text-muted-foreground text-sm">s</span>
          </span>
        );
      }

      return (
        <span className="font-mono text-lg">
          {q1Duration.toFixed(3)}
          <span className="text-muted-foreground text-sm">s</span>{" "}
          <span className="text-muted-foreground text-sm">
            +{q1Gap.toFixed(3)}s
          </span>
        </span>
      );
    },
  });

const COLUMNS = [
  helper.accessor("position", {
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
          className={cn(
            "text font-mono font-semibold text-lg text-muted-foreground",
            {
              "text-foreground": position <= 10,
              "text-primary": position <= 3,
            },
          )}
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
      return (
        <Item {...props} className="flex-nowrap p-0">
          <Avatar style={{ backgroundColor: `#${driver.team_colour}` }}>
            <AvatarImage
              src={driver.headshot_url ?? undefined}
              alt={driver.full_name}
            />
            <AvatarFallback>{driver.name_acronym}</AvatarFallback>
          </Avatar>
          <ItemContent className="gap-0">
            <ItemTitle className="text-nowrap">{driver.full_name}</ItemTitle>
            <ItemDescription className="text-nowrap text-xs">
              #{driver.driver_number} | {driver.team_name}
            </ItemDescription>
          </ItemContent>
        </Item>
      );
    },
  }),
  createQualifyingColumn(3),
  createQualifyingColumn(2),
  createQualifyingColumn(1),
  helper.accessor("gap_to_leader", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interval" />
    ),
    cell: (props) => {
      const isLeader = props.row.original.position === 1;
      if (isLeader) {
        return <span className="font-mono text-lg text-primary">Leader</span>;
      }

      const gap = props.getValue();
      if (!gap) {
        return (
          <span className="font-mono text-lg text-muted-foreground">??</span>
        );
      }

      if (!Array.isArray(gap)) {
        if (typeof gap === "string") {
          return <span className="font-mono text-lg">{gap}</span>;
        }

        return (
          <span className="font-mono text-lg">
            +{gap.toFixed(3)}
            <span className="text-muted-foreground text-sm">s</span>
          </span>
        );
      }
    },
  }),
  helper.accessor("duration", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: (props) => {
      const duration = props.getValue();
      if (!duration) {
        return (
          <span className="font-mono text-lg text-muted-foreground">??</span>
        );
      }

      if (!Array.isArray(duration)) {
        return (
          <span className="font-mono text-lg">
            {duration.toFixed(3)}
            <span className="text-muted-foreground text-sm">s</span>
          </span>
        );
      }
    },
  }),
  helper.accessor("number_of_laps", {
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Laps" />
    ),
    cell: (props) => {
      const laps = props.getValue();

      if (laps === null) {
        return (
          <span className="font-mono text-lg text-muted-foreground">??</span>
        );
      }

      return <span className="font-mono text-lg">{laps}</span>;
    },
  }),
  helper.display({
    id: "statuses",
    header: "",
    cell: (props) => {
      const result = props.row.original;
      return (
        <div className="grid w-fit grid-cols-3 gap-1">
          {result.dnf && <Badge variant="destructive">DNF</Badge>}
          {result.dns && <Badge variant="destructive">DNS</Badge>}
          {result.dsq && <Badge variant="destructive">DSQ</Badge>}
        </div>
      );
    },
  }),
];
