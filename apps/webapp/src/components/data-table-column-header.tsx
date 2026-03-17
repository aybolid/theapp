import type { Column } from "@tanstack/react-table";
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ChevronsUpDown,
  EyeOff,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import type { HTMLAttributes } from "react";

type Props<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
} & HTMLAttributes<HTMLDivElement>;

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: Props<TData, TValue>) {
  "use no memo";

  const canSort = column.getCanSort();
  const canHide = column.getCanHide();

  if (!canSort && !canHide) {
    return (
      <div className={cn("text-muted-foreground", className)} {...props}>
        {title}
      </div>
    );
  }

  const sorting = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>{title}</span>
              {canSort ? (
                sorting === "desc" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                ) : sorting === "asc" ? (
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                ) : (
                  <HugeiconsIcon icon={ChevronsUpDown} strokeWidth={2} />
                )
              ) : null}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          {canSort && (
            <>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                <span>Asc</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                <span>Desc</span>
              </DropdownMenuItem>
            </>
          )}
          {canHide && (
            <>
              {canSort && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <HugeiconsIcon icon={EyeOff} strokeWidth={2} />
                <span>Hide</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
