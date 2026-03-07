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
import { useF1SessionByKeySuspenseQuery } from "@theapp/webapp/lib/query/f1";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { Suspense } from "react";
import { PageWrapper } from "../../../-components/page-wrapper";
import { ResultsTab } from "./-tabs/results";

const searchParams = {
  tab: parseAsStringLiteral(["results"]).withDefault("results"),
};

export const Route = createFileRoute("/_auth/_sidebar/f1/session/$sessionKey")({
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const [{ tab }, setSearchParams] = useQueryStates(searchParams);

  const sessionKey = parseInt(Route.useParams().sessionKey, 10);
  const sessionQuery = useF1SessionByKeySuspenseQuery({ sessionKey });

  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Formula 1", linkOptions: { to: "/f1" } },
        `${sessionQuery.data.country_name} - ${sessionQuery.data.session_name}`,
      ]}
    >
      <Tabs
        className="contents"
        value={tab}
        onValueChange={(v) =>
          setSearchParams({ tab: searchParams.tab.parse(v) })
        }
      >
        <TabsList className="mb-4 hidden">
          <TabsTrigger value="results">Session results</TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="contents">
          <ResultsTab
            sessionKey={sessionKey}
            isQualifying={sessionQuery.data.session_type === "Qualifying"}
          />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

function PendingComponent() {
  return (
    <PageWrapper
      breadcrumbs={[
        { label: "Formula 1", linkOptions: { to: "/f1" } },
        "Session",
      ]}
    >
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
    <PageWrapper
      breadcrumbs={[
        { label: "Formula 1", linkOptions: { to: "/f1" } },
        "Session",
      ]}
    >
      <div className="container mx-auto grid max-w-3xl gap-4 p-4">
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
          <AlertTitle>Couldn't load session</AlertTitle>
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
