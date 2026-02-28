import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@theapp/ui/components/dialog";
import type { ComponentProps, FC } from "react";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

export const UploadAvatarDialog: FC<{
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton }) => {
  return (
    <Dialog>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick a new look</DialogTitle>
          <DialogDescription>
            Upload a picture so we can recognize you
          </DialogDescription>
        </DialogHeader>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
