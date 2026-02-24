import { Link } from "@tanstack/react-router";
import type { UserResponse } from "@theapp/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from "@theapp/ui/components/glimpse";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@theapp/ui/components/item";
import { User02Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import type { ComponentPropsWithoutRef, FC } from "react";

export const UserChip: FC<
  { user: UserResponse } & ComponentPropsWithoutRef<typeof Item>
> = ({ user, ...props }) => {
  return (
    <Glimpse>
      <GlimpseTrigger
        render={
          <Link to="/profile/$userId" params={{ userId: user.userId }}>
            <Item {...props} className={cn("flex-nowrap p-1", props.className)}>
              <Avatar>
                <AvatarImage src={user.profile.picture} alt="User Avatar" />
                <AvatarFallback>
                  <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                </AvatarFallback>
              </Avatar>
              <ItemContent>
                <ItemTitle>{user.profile.name}</ItemTitle>
                <ItemDescription>{user.email}</ItemDescription>
              </ItemContent>
            </Item>
          </Link>
        }
        closeDelay={0}
      />
      <GlimpseContent className="w-80">
        {user.profile.picture && <GlimpseImage src={user.profile.picture} />}
        <GlimpseTitle>{user.profile.name}</GlimpseTitle>
        {user.profile.bio && (
          <GlimpseDescription>{user.profile.bio}</GlimpseDescription>
        )}
      </GlimpseContent>
    </Glimpse>
  );
};
