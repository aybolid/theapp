import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
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
  DropdownMenuSeparator,
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
import { Spinner } from "@theapp/ui/components/spinner";
import {
  DashboardSquareIcon,
  Gift,
  Logout01Icon,
  Mail01Icon,
  User02Icon,
  Users,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { AdminOnly } from "@theapp/webapp/components/role-guard";
import {
  useMeSuspenseQuery,
  useSignoutMutation,
} from "@theapp/webapp/lib/query/auth";
import { type FC, Suspense } from "react";

export const AppSidebar: FC = () => {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link className="font-bold text-lg" to="/">
                  <HugeiconsIcon
                    className="text-primary"
                    icon={DashboardSquareIcon}
                    strokeWidth={2}
                  />
                  <span>THEAPP.</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/wishes">
                    <HugeiconsIcon icon={Gift} strokeWidth={2} />
                    <span>Wishes</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <AdminOnly>
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link to="/users">
                      <HugeiconsIcon icon={Users} strokeWidth={2} />
                      <span>Users</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link to="/invites">
                      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
                      <span>Invites</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </AdminOnly>
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
  const queryClient = useQueryClient();
  const router = useRouter();

  const { state, isMobile } = useSidebar();
  const meQuery = useMeSuspenseQuery();

  const signoutMutation = useSignoutMutation({
    onSettled: () => {
      queryClient.removeQueries();
      router.invalidate();
    },
  });

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
              <span className="text-nowrap font-medium">
                {meQuery.data.profile.name}
              </span>
              <span className="text-nowrap text-muted-foreground">
                {meQuery.data.email}
              </span>
            </div>
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent
        side={state === "expanded" || isMobile ? "top" : "inline-end"}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                to="/profile/$userId"
                params={{ userId: meQuery.data.userId }}
              >
                <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                <span>Profile</span>
              </Link>
            }
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signoutMutation.isPending}
          onClick={() => signoutMutation.mutate({ sessionId: undefined })}
        >
          {signoutMutation.isPending ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          )}
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
