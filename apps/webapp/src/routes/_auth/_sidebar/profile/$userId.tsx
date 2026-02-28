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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Alert01Icon,
  Edit01Icon,
  Mail01Icon,
  Photo,
  UserIcon,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { LazyDevErrorStackDisplay } from "@theapp/webapp/components/lazy";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import { useUserByIdSuspenseQuery } from "@theapp/webapp/lib/query/users";
import { lazy, Suspense } from "react";
import { PageWrapper } from "../../-components/page-wrapper";

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
        title: "User Profile | theapp",
      },
    ],
  }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();

  const meQuery = useMeSuspenseQuery();
  const userQuery = useUserByIdSuspenseQuery(userId);

  const isMe = meQuery.data.userId === userQuery.data.userId;

  return (
    <PageWrapper breadcrumbs={[userQuery.data.profile.name]}>
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
      </div>
    </PageWrapper>
  );
}

function PendingComponent() {
  return (
    <Empty className="size-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading the profile...</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="container mx-auto grid max-w-3xl gap-4 p-4">
      <Alert variant="destructive">
        <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} />
        <AlertTitle>Couldn't load the profile</AlertTitle>
        <AlertDescription>
          Something's not right. Try again later?
        </AlertDescription>
      </Alert>
      <Suspense>
        <LazyDevErrorStackDisplay error={error} />
      </Suspense>
    </div>
  );
}
