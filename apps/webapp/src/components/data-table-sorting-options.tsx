import type { Table } from "@tanstack/react-table";
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ChevronsUpDown,
} from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import type { ComponentPropsWithoutRef, FC } from "react";

export const DataTableSortingOptions: FC<
  {
    table: Table<unknown>;
    labelsMap?: Record<string, string>;
    onlyIcon?: boolean;
  } & ComponentPropsWithoutRef<typeof Button>
> = ({ table, labelsMap = {}, onlyIcon = false, ...props }) => {
  "use no memo";

  const columns = table.getAllColumns().filter((column) => column.getCanSort());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size={onlyIcon ? "icon" : "default"} {...props}>
            <HugeiconsIcon icon={ChevronsUpDown} strokeWidth={2} />
            {!onlyIcon && <span>Sorting</span>}
          </Button>
        }
      />
      <DropdownMenuContent className="w-max">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle sorting</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => {
            const sorting = column.getIsSorted();
            const label = labelsMap[column.id];
            return (
              <DropdownMenuItem
                key={column.id}
                closeOnClick={false}
                onClick={() => column.toggleSorting(sorting !== "desc")}
                className={cn(!label && "text-destructive")}
              >
                {sorting === "desc" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                ) : sorting === "asc" ? (
                  <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                ) : (
                  <HugeiconsIcon
                    className="opacity-0"
                    icon={ChevronsUpDown}
                    strokeWidth={2}
                  />
                )}
                {label || column.id}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
