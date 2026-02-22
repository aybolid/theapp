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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import { Button } from "@theapp/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@theapp/ui/components/card";
import { Skeleton } from "@theapp/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@theapp/ui/components/tabs";
import {
  Activity01Icon,
  Alert01Icon,
  Bug01Icon,
  Edit01Icon,
  Photo,
  Settings01Icon,
  UserIcon,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import {
  LazyDevErrorStackDisplay,
  LazyDevJsonDisplay,
} from "@theapp/webapp/lib/lazy";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { Suspense } from "react";

const searchParams = {
  tab: parseAsStringLiteral(["activity", "settings", "debug"]).withDefault(
    "activity",
  ),
};

export const Route = createFileRoute("/_auth/_sidebar/profile/{-$userId}")({
  head: () => ({
    meta: [
      {
        title: "My Profile | theapp",
      },
    ],
  }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const [{ tab }, setSearchParams] = useQueryStates(searchParams);

  const { userId } = Route.useParams();
  const isMe = !userId;

  const userQuery = useMeSuspenseQuery();

  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Card>
        <CardHeader className="border-b">
          <Avatar className="size-12">
            <AvatarImage
              src={userQuery.data.profile.picture}
              alt={userQuery.data.profile.name}
            />
            <AvatarFallback>
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        {userQuery.data.profile.bio && (
          <CardContent>
            <p className="text-muted-foreground">
              {userQuery.data.profile.bio}
            </p>
          </CardContent>
        )}
        {isMe && (
          <CardFooter className="justify-end gap-2 py-2">
            <Button variant="secondary" size="xs">
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
              <span>Edit profile</span>
            </Button>
            <Button variant="secondary" size="xs">
              <HugeiconsIcon icon={Photo} strokeWidth={2} />
              <span>Upload avatar</span>
            </Button>
          </CardFooter>
        )}
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) =>
          setSearchParams({
            tab: searchParams.tab.parse(v),
          })
        }
      >
        <TabsList className="w-full">
          <TabsTrigger value="activity">
            <HugeiconsIcon icon={Activity01Icon} strokeWidth={2} />
            <span>Activity</span>
          </TabsTrigger>
          {isMe && (
            <TabsTrigger value="settings">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              <span>Settings</span>
            </TabsTrigger>
          )}
          {import.meta.env.DEV && (
            <TabsTrigger value="debug">
              <HugeiconsIcon icon={Bug01Icon} strokeWidth={2} />
              <span>Debug</span>
            </TabsTrigger>
          )}
        </TabsList>

        {import.meta.env.DEV && (
          <TabsContent value="debug">
            <Suspense>
              <LazyDevJsonDisplay value={userQuery.data} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function PendingComponent() {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Card>
        <CardHeader className="border-b">
          <Skeleton className="size-12 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8" />
        </CardContent>
      </Card>
      <Skeleton className="h-8" />
    </div>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        <AlertTitle>Profile loading failed</AlertTitle>
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
