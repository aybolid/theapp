import { Link, type LinkComponentProps } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@theapp/ui/components/breadcrumb";
import { SidebarTrigger } from "@theapp/ui/components/sidebar";
import { cn } from "@theapp/ui/lib/utils";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { type FC, Fragment, type PropsWithChildren } from "react";

type BreadcrumbData =
  | string
  | {
      label: string;
      linkOptions: Omit<LinkComponentProps, "children">;
    };

export const PageWrapper: FC<
  PropsWithChildren<{ breadcrumbs?: BreadcrumbData[] }>
> = ({ children, breadcrumbs = [] }) => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem
              className={cn(breadcrumbs.length > 0 && "hidden md:block")}
            >
              <BreadcrumbLink render={<Link to="/">Home</Link>} />
            </BreadcrumbItem>
            {breadcrumbs.map((data, idx) => (
              <Fragment key={typeof data === "string" ? data : data.label}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem
                  className={cn(
                    idx !== breadcrumbs.length - 1 && "hidden md:block",
                  )}
                >
                  {typeof data === "string" ? (
                    <BreadcrumbPage>{data}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link {...data.linkOptions}>{data.label}</Link>}
                    />
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <ThemeMenu className="ml-auto" />
      </header>
      <main className="size-full p-4 pt-0">{children}</main>
    </>
  );
};
