import { useQueryClient } from "@tanstack/react-query";
import type { WishResponse } from "@theapp/schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@theapp/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import { Delete01Icon, Edit01Icon, Tick01Icon, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import {
  useDeleteWishMutation,
  useUpdateWishReservationMutation,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import type { ComponentProps, FC } from "react";

type DropdownMenuTriggerProps = ComponentProps<typeof DropdownMenuTrigger>;

export const WishActionsMenu: FC<{
  wish: WishResponse;
  isReservedByMe: boolean;
  isOwnedByMe: boolean;
  render: NonNullable<DropdownMenuTriggerProps["render"]>;
  nativeButton?: DropdownMenuTriggerProps["nativeButton"];
}> = ({ wish, isOwnedByMe, isReservedByMe, render, nativeButton }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useDeleteWishMutation({
    onSuccess: (_, { wishId }) => {
      queryClient.setQueryData<WishResponse[]>(
        wishesQueryOptions.queryKey,
        (prev) => prev?.filter((w) => w.wishId !== wishId),
      );
      queryClient.invalidateQueries({
        queryKey: wishesQueryOptions.queryKey,
      });
    },
    onError: () => {
      toast.error("Failed to delete wish");
    },
  });

  const updateReservationMutation = useUpdateWishReservationMutation({
    onSuccess: (wish) => {
      queryClient.setQueryData<WishResponse[]>(
        wishesQueryOptions.queryKey,
        (prev) => prev?.map((w) => (w.wishId === wish.wishId ? wish : w)),
      );
      queryClient.invalidateQueries({
        queryKey: wishesQueryOptions.queryKey,
      });
    },
    onError: () => toast.error("Failed to remove wish reservation"),
  });

  if (!isOwnedByMe && !isReservedByMe) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger nativeButton={nativeButton} render={render} />
      <DropdownMenuContent className="w-64">
        {isReservedByMe && (
          <DropdownMenuGroup>
            <AlertDialog>
              <AlertDialogTrigger
                nativeButton={false}
                render={
                  <DropdownMenuItem
                    variant="destructive"
                    closeOnClick={false}
                    disabled={updateReservationMutation.isPending}
                  >
                    <HugeiconsIcon icon={X} strokeWidth={2} />
                    <span>Stop reservation</span>
                  </DropdownMenuItem>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will remove your reservation. You will be able
                    to reserve the wish later if it is still has no other
                    reserver.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={updateReservationMutation.isPending}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogCancel
                    render={
                      <AlertDialogAction
                        variant="destructive"
                        disabled={updateReservationMutation.isPending}
                        onClick={() =>
                          updateReservationMutation.mutate({
                            wishId: wish.wishId,
                            action: "stop",
                          })
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    }
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        )}
        {isOwnedByMe && (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
              <span>Edit</span>
            </DropdownMenuItem>
            {wish.isCompleted ? (
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
            <AlertDialog>
              <AlertDialogTrigger
                nativeButton={false}
                render={
                  <DropdownMenuItem
                    variant="destructive"
                    closeOnClick={false}
                    disabled={deleteMutation.isPending}
                  >
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                    <span>Delete</span>
                  </DropdownMenuItem>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your wish.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogCancel
                    render={
                      <AlertDialogAction
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() =>
                          deleteMutation.mutate({
                            wishId: wish.wishId,
                          })
                        }
                      >
                        Delete
                      </AlertDialogAction>
                    }
                  />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
