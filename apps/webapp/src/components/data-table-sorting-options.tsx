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
import type { ComponentPropsWithoutRef } from "react";

export function DataTableSortingOptions<TData>({
  table,
  labelsMap = {},
  onlyIcon = false,
  ...props
}: {
  table: Table<TData>;
  labelsMap?: Record<string, string>;
  onlyIcon?: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
  "use no memo";

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
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanSort(),
            )
            .map((column) => {
              return (
                <DropdownMenuItem
                  key={column.id}
                  closeOnClick={false}
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() !== "desc")
                  }
                >
                  {column.getIsSorted() === "desc" ? (
                    <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                  ) : column.getIsSorted() === "asc" ? (
                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                  ) : (
                    <HugeiconsIcon
                      className="opacity-0"
                      icon={ChevronsUpDown}
                      strokeWidth={2}
                    />
                  )}
                  {labelsMap[column.id] || column.id}
                </DropdownMenuItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
