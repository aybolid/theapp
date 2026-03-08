import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@theapp/ui/components/tabs";
import { Alert01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { beforeLoadAccessGuard } from "@theapp/webapp/lib/utils";
import {
  createStandardSchemaV1,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { Suspense } from "react";
import { PageWrapper } from "../../-components/page-wrapper";
import { DriverStandingsTab } from "./-tabs/driver-standings";
import { ScheduleTab } from "./-tabs/schedule";

const searchParams = {
  tab: parseAsStringLiteral(["schedule", "driver-standings"]).withDefault(
    "schedule",
  ),
};

export const Route = createFileRoute("/_auth/_sidebar/f1/")({
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  beforeLoad: async (ctx) => {
    await beforeLoadAccessGuard(ctx.context.queryClient, ["f1"]);
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const [{ tab }, setSearchParams] = useQueryStates(searchParams);

  return (
    <PageWrapper breadcrumbs={["Formula 1"]}>
      <Tabs
        className="container mx-auto grid max-w-3xl gap-4"
        value={tab}
        onValueChange={(v) =>
          setSearchParams({ tab: searchParams.tab.parse(v) })
        }
      >
        <h1 className="font-semibold text-lg">
          Formula 1 Season {new Date().getFullYear()}
        </h1>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="driver-standings">Driver Standings</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>
        <TabsContent value="driver-standings">
          <DriverStandingsTab />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

function PendingComponent() {
  return (
    <PageWrapper breadcrumbs={["Formula 1"]}>
      <Empty className="size-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Pit stop...</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </PageWrapper>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <PageWrapper breadcrumbs={["Formula 1"]}>
      <div className="container mx-auto grid max-w-3xl gap-4 p-4">
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
          <AlertTitle>Unexpected error happened</AlertTitle>
          <AlertDescription>
            Something went wrong. Maybe try refreshing?
          </AlertDescription>
        </Alert>
        <Suspense>
          <LazyDevErrorStackDisplay error={error} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
