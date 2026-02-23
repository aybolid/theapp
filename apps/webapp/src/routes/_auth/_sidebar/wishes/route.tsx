import { createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import type { WishResponse } from "@theapp/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@theapp/ui/components/empty";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Delete01Icon,
  Edit01Icon,
  EllipsisVertical,
  ExternalLink,
  Tick01Icon,
  User02Icon,
  X,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { DataTable } from "@theapp/webapp/components/data-table";
import { LinkPreview } from "@theapp/webapp/components/link-preview";
import { useMeSuspenseQuery } from "@theapp/webapp/lib/query/auth";
import { useWishesSuspenseQuery } from "@theapp/webapp/lib/query/wishes";
import dayjs from "dayjs";

export const Route = createFileRoute("/_auth/_sidebar/wishes")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

const helper = createColumnHelper<
  WishResponse & { isOwnedByMe: boolean; isReservedByMe: boolean }
>();

const COLUMNS = [
  helper.accessor("owner", {
    header: "Owner",
    cell: (props) => {
      const owner = props.getValue();
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <Avatar>
              <AvatarImage src={owner.profile.picture} alt="User Avatar" />
              <AvatarFallback>
                <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{owner.profile.name}</span>
            <span className="text-muted-foreground">{owner.email}</span>
          </div>
        </div>
      );
    },
  }),
  helper.accessor("isCompleted", {
    header: "Status",
    cell: (props) =>
      props.getValue() ? (
        <Badge>Completed</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  }),
  helper.accessor("name", {
    header: "Name",
    cell: (props) => <span className="font-medium">{props.getValue()}</span>,
  }),
  helper.accessor("note", {
    header: "Note",
    cell: (props) => (
      <span className="text-muted-foreground text-sm">{props.getValue()}</span>
    ),
  }),
  helper.accessor("link", {
    header: "Link",
    cell: (props) => {
      const url = props.getValue();
      return (
        <LinkPreview
          url={url}
          render={
            <Button
              nativeButton={false}
              variant="secondary"
              size="xs"
              render={
                <a href={url} target="_blank">
                  <HugeiconsIcon icon={ExternalLink} strokeWidth={2} />
                  <span>Follow link</span>
                </a>
              }
            />
          }
        />
      );
    },
  }),
  helper.accessor("reserver", {
    header: "Reserver",
    cell: (props) => {
      const reserver = props.getValue();

      if (!reserver) {
        if (!props.row.original.isOwnedByMe) {
          return <Button size="xs">Reserve</Button>;
        } else {
          return (
            <span className="text-muted-foreground text-sm">No reserver</span>
          );
        }
      }

      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <Avatar>
              <AvatarImage src={reserver.profile.picture} alt="User Avatar" />
              <AvatarFallback>
                <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{reserver.profile.name}</span>
            <span className="text-muted-foreground">{reserver.email}</span>
          </div>
        </div>
      );
    },
  }),
  helper.accessor("createdAt", {
    header: "Created at",
    cell: (props) => (
      <span className="text-muted-foreground text-sm">
        {dayjs(props.getValue()).format("MMM DD, YYYY, HH:mm")}
      </span>
    ),
  }),
  helper.display({
    header: "Actions",
    cell: (props) => {
      if (
        !props.row.original.isOwnedByMe &&
        !props.row.original.isReservedByMe
      ) {
        return (
          <span className="text-muted-foreground text-sm">
            No actions available
          </span>
        );
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="ghost">
                <HugeiconsIcon icon={EllipsisVertical} strokeWidth={2} />
              </Button>
            }
          />
          <DropdownMenuContent className="w-64">
            {props.row.original.isOwnedByMe && (
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
                  <span>Edit</span>
                </DropdownMenuItem>{" "}
                {props.row.original.isCompleted ? (
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={X} strokeWidth={2} />
                    <span>Mark as pending</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} />
                    <span>Mark as completed</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

function RouteComponent() {
  const meQuery = useMeSuspenseQuery();
  const wishesQuery = useWishesSuspenseQuery();

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button>
          <span>New wish</span>
        </Button>
      </div>

      <DataTable
        // @ts-expect-error
        columns={COLUMNS}
        data={wishesQuery.data.map((wish) => ({
          ...wish,
          isOwnedByMe: meQuery.data.userId === wish.ownerId,
          isReservedByMe: meQuery.data.userId === wish.reserverId,
        }))}
      />
    </div>
  );
}

function PendingComponent() {
  return (
    <Empty className="size-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading wishes</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
