import {
  createFileRoute,
  type ErrorComponentProps,
  Link,
} from "@tanstack/react-router";
import type { F1Session } from "@theapp/schemas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@theapp/ui/components/accordion";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import { Alert01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { useF1SessionsSuspenseQuery } from "@theapp/webapp/lib/query/f1";
import {
  beforeLoadAccessGuard,
  countryCodeEmoji,
} from "@theapp/webapp/lib/utils";
import dayjs from "dayjs";
import { type FC, Suspense } from "react";
import { PageWrapper } from "../../-components/page-wrapper";

export const Route = createFileRoute("/_auth/_sidebar/f1/")({
  beforeLoad: async (ctx) => {
    await beforeLoadAccessGuard(ctx.context.queryClient, ["f1"]);
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
});

function RouteComponent() {
  const sessionsQuery = useF1SessionsSuspenseQuery();

  const groupedByMeetingKey = sessionsQuery.data.reduce<
    Record<F1Session["meeting_key"], F1Session[]>
  >((acc, curr) => {
    // remove test sessions
    if (curr.session_name.includes("Day")) {
      return acc;
    }
    if (!acc[curr.meeting_key]) {
      acc[curr.meeting_key] = [];
    }
    acc[curr.meeting_key]?.push(curr);
    return acc;
  }, {});

  const now = Date.now();
  let nextMeetingKey: string | undefined;

  const sortedMeetings = Object.entries(groupedByMeetingKey).sort((a, b) => {
    const aFirst = a[1][0];
    const bFirst = b[1][0];
    return (
      new Date(aFirst?.date_start || 0).getTime() -
      new Date(bFirst?.date_start || 0).getTime()
    );
  });

  for (const [key, sessions] of sortedMeetings) {
    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );
    const lastSession = sortedSessions[sortedSessions.length - 1];
    if (lastSession && new Date(lastSession.date_end).getTime() > now) {
      nextMeetingKey = key;
      break;
    }
  }

  return (
    <PageWrapper breadcrumbs={["Formula 1"]}>
      <div className="container mx-auto grid max-w-3xl gap-4">
        <h1 className="font-semibold text-lg">
          Formula 1 Season {new Date().getFullYear()}
        </h1>
        <Accordion defaultValue={nextMeetingKey ? [nextMeetingKey] : undefined}>
          {sortedMeetings.map(([key, sessions]) => {
            const sortedSessions = [...sessions].sort(
              (a, b) =>
                new Date(a.date_start).getTime() -
                new Date(b.date_start).getTime(),
            );
            const firstSession = sortedSessions[0];
            const lastSession = sortedSessions[sortedSessions.length - 1];

            const country = firstSession?.country_name ?? "Unknown Country";
            const countryCode = firstSession?.country_code;
            const circuit =
              firstSession?.circuit_short_name ?? "Unknown Circuit";
            const isSprintWeekend = sortedSessions.some((session) =>
              session.session_name.includes("Sprint"),
            );
            const isNext = key === nextMeetingKey;

            const startDate = dayjs(firstSession?.date_start);
            const endDate = dayjs(lastSession?.date_end);
            const weekendDates =
              startDate.month() === endDate.month()
                ? `${startDate.format("MMM DD")} - ${endDate.format("DD")}`
                : `${startDate.format("MMM DD")} - ${endDate.format("MMM DD")}`;

            return (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="hover:no-underline">
                  <Item className="justify-between p-0 pr-4">
                    <ItemTitle className={cn(isNext && "text-primary")}>
                      {countryCode &&
                        countryCodeEmoji(countryCode.toLowerCase())}{" "}
                      {country}
                    </ItemTitle>
                    <ItemDescription className="flex items-center gap-2">
                      {isSprintWeekend && <Badge>Sprint</Badge>}
                      <span className="whitespace-nowrap font-normal text-muted-foreground text-xs">
                        {weekendDates}
                      </span>
                    </ItemDescription>
                  </Item>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <p className="text-muted-foreground">{circuit}</p>
                  <MeetingDisplay
                    sessions={sortedSessions}
                    nextSessionIndex={
                      isNext
                        ? sortedSessions.findIndex(
                            (s) => new Date(s.date_end).getTime() > now,
                          )
                        : -1
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </PageWrapper>
  );
}

const MeetingDisplay: FC<{
  sessions: F1Session[];
  nextSessionIndex?: number;
}> = ({ sessions, nextSessionIndex }) => {
  return (
    <ItemGroup>
      {sessions.map((session, index) => {
        const isNextSession = index === nextSessionIndex;

        return (
          <Item
            key={session.session_key}
            variant={session.session_type === "Practice" ? "default" : "muted"}
            size="xs"
            className={cn(
              "justify-between",
              isNextSession && "border-primary bg-primary/10",
            )}
          >
            <ItemContent>
              <ItemTitle>{session.session_name}</ItemTitle>
              <ItemDescription>
                {dayjs(session.date_start).format("ddd, MMM D, HH:mm")} -{" "}
                {dayjs(session.date_end).format("HH:mm")}
              </ItemDescription>
            </ItemContent>
            {dayjs(session.date_start).isBefore(dayjs()) && (
              <ItemActions>
                <Button
                  size="xs"
                  variant="link"
                  nativeButton={false}
                  render={
                    <Link
                      to="/f1/session/$sessionKey"
                      params={{ sessionKey: session.session_key.toString() }}
                    >
                      View
                    </Link>
                  }
                />
              </ItemActions>
            )}
          </Item>
        );
      })}
    </ItemGroup>
  );
};

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
          <AlertTitle>Couldn't load Formula 1 sessions</AlertTitle>
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
