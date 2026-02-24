import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  IdentityCardIcon,
  Mail01Icon,
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
import {
  createStandardSchemaV1,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SessionsList } from "./-components/sessions-list";

const searchParams = {
  tab: parseAsStringLiteral(["activity", "settings", "debug"]).withDefault(
    "activity",
  ),
};

const LazyEditProfileDialog = lazy(() =>
  import("./-components/edit-profile-dialog").then((m) => ({
    default: m.EditProfileDialog,
  })),
);

const LazyUploadAvatarDialog = lazy(() =>
  import("./-components/upload-avatar-dialog").then((m) => ({
    default: m.UploadAvatarDialog,
  })),
);

export const Route = createFileRoute("/_auth/_sidebar/profile/$userId")({
  head: () => ({
    meta: [
      {
        title: "My Profile | theapp",
      },
    ],
  }),
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const [{ tab }, setSearchParams] = useQueryStates(searchParams);
  // const { userId } = Route.useParams();

  const userQuery = useMeSuspenseQuery();

  const isMe = true;

  return (
    <div className="container mx-auto grid max-w-3xl gap-4">
      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage
              src={userQuery.data.profile.picture}
              alt={userQuery.data.profile.name}
            />
            <AvatarFallback>
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle>{userQuery.data.profile.name}</CardTitle>
            <CardDescription className="flex gap-1">
              <Badge variant="secondary">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
                <span>{userQuery.data.email}</span>
              </Badge>
            </CardDescription>
          </div>
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
            <Suspense
              fallback={
                <Button variant="secondary" size="xs" disabled>
                  <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
                  <span>Edit profile</span>
                </Button>
              }
            >
              <LazyEditProfileDialog
                profile={userQuery.data.profile}
                render={
                  <Button variant="secondary" size="xs">
                    <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
                    <span>Edit profile</span>
                  </Button>
                }
              />
            </Suspense>
            <Suspense
              fallback={
                <Button variant="secondary" size="xs" disabled>
                  <HugeiconsIcon icon={Photo} strokeWidth={2} />
                  <span>Upload avatar</span>
                </Button>
              }
            >
              <LazyUploadAvatarDialog
                render={
                  <Button variant="secondary" size="xs">
                    <HugeiconsIcon icon={Photo} strokeWidth={2} />
                    <span>Upload avatar</span>
                  </Button>
                }
              />
            </Suspense>
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
        <TabsList className="w-full" variant="line">
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

        {isMe && (
          <TabsContent value="settings">
            <Tabs>
              <TabsList className="w-full">
                <TabsTrigger value="sessions">
                  <HugeiconsIcon icon={IdentityCardIcon} strokeWidth={2} />
                  <span>Sessions</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sessions">
                <QueryErrorResetBoundary>
                  {({ reset }) => (
                    <ErrorBoundary
                      onReset={reset}
                      fallbackRender={({ error, resetErrorBoundary }) => (
                        <>
                          <Alert variant="destructive">
                            <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
                            <AlertTitle>Sessions loading failed</AlertTitle>
                            <AlertDescription>
                              Some unexpected error occurred.
                            </AlertDescription>
                            <AlertAction>
                              <Button
                                variant="secondary"
                                size="xs"
                                onClick={resetErrorBoundary}
                              >
                                Retry
                              </Button>
                            </AlertAction>
                          </Alert>
                          <Suspense>
                            <LazyDevErrorStackDisplay
                              className="mt-2"
                              error={error as Error}
                            />
                          </Suspense>
                        </>
                      )}
                    >
                      <Suspense
                        fallback={
                          <div className="space-y-4">
                            <Skeleton className="p-8" />
                            <Skeleton className="p-8" />
                          </div>
                        }
                      >
                        <SessionsList />
                      </Suspense>
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
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
