import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { UserAgentData } from "@theapp/schemas";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import { Logout01Icon, Unlink01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import {
  useSignoutAllMutation,
  useSignoutMutation,
} from "@theapp/webapp/lib/query/auth";
import { useSessionsSuspenseQuery } from "@theapp/webapp/lib/query/sessions";
import dayjs from "dayjs";
import type { FC } from "react";

export const SessionsList: FC = () => {
  const sessionsQuery = useSessionsSuspenseQuery();

  const router = useRouter();
  const queryClient = useQueryClient();

  const signoutMutation = useSignoutMutation({
    onSuccess: () => {
      sessionsQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to invalidate session");
    },
  });

  const signoutAllMutation = useSignoutAllMutation({
    onSettled: () => {
      queryClient.removeQueries();
      router.invalidate();
    },
  });

  return (
    <ItemGroup>
      {sessionsQuery.data.map((session) => (
        <Item variant="muted" key={session.sessionId}>
          <ItemContent>
            <ItemTitle>{formatUserAgent(session.uaData)}</ItemTitle>
            <ItemDescription className="flex flex-wrap gap-1">
              {session.isCurrent && (
                <Badge className="font-normal">You're on this device</Badge>
              )}
              <Badge variant="outline" className="font-normal">
                First seen:{" "}
                {dayjs(session.createdAt).format("MMM DD, YYYY, HH:mm")}
              </Badge>
              <Badge variant="outline" className="font-normal">
                Active:{" "}
                {dayjs(session.lastUsedAt).format("MMM DD, YYYY, HH:mm")}
              </Badge>
            </ItemDescription>
          </ItemContent>
          {!session.isCurrent && (
            <ItemActions>
              <Button
                variant="destructive"
                size="icon-sm"
                disabled={signoutMutation.isPending}
                onClick={() =>
                  signoutMutation.mutate({ sessionId: session.sessionId })
                }
              >
                <HugeiconsIcon icon={Unlink01Icon} strokeWidth={2} />
              </Button>
            </ItemActions>
          )}
        </Item>
      ))}
      <Button
        className="md:w-fit"
        variant="destructive"
        disabled={signoutAllMutation.isPending}
        onClick={() => signoutAllMutation.mutate()}
      >
        {signoutAllMutation.isPending ? (
          <Spinner />
        ) : (
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
        )}
        <span>Sign out everywhere</span>
      </Button>
    </ItemGroup>
  );
};

function formatUserAgent(data: UserAgentData): string {
  const { browser, os, device } = data;

  const browserName = browser.name || "Unknown Browser";
  const browserStr = browser.version
    ? `${browserName} ${browser.version}`
    : browserName;

  const osName = os.name || "Unknown OS";
  const osStr = os.version ? `${osName} ${os.version}` : osName;

  const deviceParts: string[] = [];
  if (device.vendor || device.model) {
    deviceParts.push([device.vendor, device.model].filter(Boolean).join(" "));
  }
  if (device.type) {
    deviceParts.push(
      device.type.charAt(0).toUpperCase() + device.type.slice(1),
    );
  }

  const contextStr =
    deviceParts.length > 0 ? `(${deviceParts.join("; ")})` : "";

  return `${browserStr} on ${osStr} ${contextStr}`.trim();
}
