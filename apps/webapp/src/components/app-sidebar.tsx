import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@theapp/ui/components/sidebar";
import { AccountSetting02Icon, User02Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { type FC, Suspense } from "react";
import { useMeSuspenseQuery } from "../lib/query/auth";
import { UserAccountDialog } from "./user-account-dialog";

export const AppSidebar: FC = () => {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2"></SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Suspense fallback={<SidebarMenuSkeleton />}>
              <UserButton />
            </Suspense>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const UserButton: FC = () => {
  const { state } = useSidebar();
  const meQuery = useMeSuspenseQuery();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton size="lg">
            <Avatar>
              <AvatarImage
                src={meQuery.data.profile.picture}
                alt="User Avatar"
              />
              <AvatarFallback>
                <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{meQuery.data.profile.name}</span>
              <span className="text-muted-foreground">
                {meQuery.data.email}
              </span>
            </div>
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent side={state === "expanded" ? "top" : "inline-end"}>
        <DropdownMenuItem
          render={
            <Link to="/profile">
              <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
              <span>Profile</span>
            </Link>
          }
        />
        <DropdownMenuGroup>
          <UserAccountDialog
            nativeButton={false}
            meQuery={meQuery}
            render={
              <DropdownMenuItem closeOnClick={false}>
                <HugeiconsIcon icon={AccountSetting02Icon} strokeWidth={2} />
                <span>Account</span>
              </DropdownMenuItem>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
