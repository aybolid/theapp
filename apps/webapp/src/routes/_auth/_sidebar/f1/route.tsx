import { createFileRoute } from "@tanstack/react-router";
import type { F1Session } from "@theapp/schemas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@theapp/ui/components/accordion";
import { Badge } from "@theapp/ui/components/badge";
import {
  Item,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@theapp/ui/components/item";
import { useF1SessionsSuspenseQuery } from "@theapp/webapp/lib/query/f1";
import { countryCodeEmoji } from "@theapp/webapp/lib/utils";
import dayjs from "dayjs";
import type { FC } from "react";
import { PageWrapper } from "../../-components/page-wrapper";

export const Route = createFileRoute("/_auth/_sidebar/f1")({
  component: RouteComponent,
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

  return (
    <PageWrapper breadcrumbs={["Formula 1 season"]}>
      <div className="container mx-auto grid max-w-3xl gap-4">
        <Accordion>
          {Object.entries(groupedByMeetingKey).map(([key, sessions], idx) => {
            const country = sessions[0]?.country_name ?? "Unknown Country";
            const countryCode = sessions[0]?.country_code;
            const circuit =
              sessions[0]?.circuit_short_name ?? "Unknown Circuit";
            const isSprintWeekend = !!sessions.find((session) =>
              session.session_name.includes("Sprint"),
            );

            return (
              <AccordionItem key={key}>
                <AccordionTrigger>
                  <p>
                    <span>
                      {idx + 1}.{" "}
                      {countryCode &&
                        countryCodeEmoji(countryCode.toLowerCase())}{" "}
                      {country}
                    </span>
                    <span className="text-muted-foreground"> {circuit}</span>
                  </p>
                  {isSprintWeekend && <Badge className="ml-4">Sprint</Badge>}
                </AccordionTrigger>
                <AccordionContent className="rounded-md bg-muted/20 p-4">
                  <MeetingDisplay sessions={sessions} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </PageWrapper>
  );
}

const MeetingDisplay: FC<{ sessions: F1Session[] }> = ({ sessions }) => {
  return (
    <ItemGroup>
      {sessions.map((session) => (
        <Item
          key={session.session_key}
          variant={session.session_type === "Practice" ? "outline" : "muted"}
          size="xs"
          className="justify-between"
        >
          <ItemTitle>{session.session_name}</ItemTitle>
          <ItemDescription>
            {dayjs(session.date_start).format("MMM D, YYYY, HH:mm")} -{" "}
            {dayjs(session.date_end).format("MMM D, YYYY, HH:mm")}
          </ItemDescription>
        </Item>
      ))}
    </ItemGroup>
  );
};
