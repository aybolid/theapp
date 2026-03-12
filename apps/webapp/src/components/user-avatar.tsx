import type { UserWithProfile } from "@theapp/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import { User02Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import type { ComponentPropsWithoutRef, FC } from "react";
import { s3ObjectUrl } from "../lib/utils";

export const UserAvatar: FC<
  { user: UserWithProfile } & ComponentPropsWithoutRef<typeof Avatar>
> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      <AvatarImage
        src={
          user.profile.picture ? s3ObjectUrl(user.profile.picture) : undefined
        }
        alt={user.profile.name}
      />
      <AvatarFallback>
        <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
      </AvatarFallback>
    </Avatar>
  );
};
