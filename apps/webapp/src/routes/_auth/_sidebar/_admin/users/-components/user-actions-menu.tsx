import { useQueryClient } from "@tanstack/react-query";
import type { UserWithProfileAndAccess } from "@theapp/schemas";
import { Badge } from "@theapp/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import { UserCog, UserLock01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import {
  usersQueryOptions,
  useUpdateUserMutation,
} from "@theapp/webapp/lib/query/users";
import { type ComponentProps, type FC, lazy, Suspense } from "react";

const LazyEditAccessDialog = lazy(() =>
  import("./edit-access-dailog").then((m) => ({ default: m.EditAccessDialog })),
);

type DropdownMenuTriggerProps = ComponentProps<typeof DropdownMenuTrigger>;

export const UserActionsMenu: FC<{
  user: UserWithProfileAndAccess;
  isMe: boolean;
  render: NonNullable<DropdownMenuTriggerProps["render"]>;
  nativeButton?: DropdownMenuTriggerProps["nativeButton"];
}> = ({ user, isMe, render, nativeButton }) => {
  const queryClient = useQueryClient();

  const updateMutation = useUpdateUserMutation({
    onSuccess: (user) => {
      queryClient.setQueryData(usersQueryOptions.queryKey, (prev) =>
        prev?.map((u) => (u.userId === user.userId ? user : u)),
      );
      queryClient.invalidateQueries({ queryKey: usersQueryOptions.queryKey });
    },
    onError: () => toast.error("Failed to update user"),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton={nativeButton} render={render} />
      <DropdownMenuContent
        className="w-max"
        onKeyDown={(e) => e.preventBaseUIHandler()}
      >
        <DropdownMenuGroup>
          <Suspense
            fallback={
              <DropdownMenuItem disabled>
                <HugeiconsIcon icon={UserCog} strokeWidth={2} />
                <span>Edit access</span>
              </DropdownMenuItem>
            }
          >
            <LazyEditAccessDialog
              isMe={isMe}
              access={user.access}
              nativeButton={false}
              render={
                <DropdownMenuItem closeOnClick={false}>
                  <HugeiconsIcon icon={UserCog} strokeWidth={2} />
                  <span>Edit access</span>
                </DropdownMenuItem>
              }
            />
          </Suspense>
          {!isMe && (
            <DropdownMenuItem
              disabled={updateMutation.isPending}
              onClick={() =>
                updateMutation.mutate({
                  userId: user.userId,
                  status: user.status === "active" ? "inactive" : "active",
                })
              }
            >
              <HugeiconsIcon icon={UserLock01Icon} strokeWidth={2} />
              Set status to{" "}
              {user.status === "active" ? (
                <Badge variant="destructive">Inactive</Badge>
              ) : (
                <Badge>Active</Badge>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
