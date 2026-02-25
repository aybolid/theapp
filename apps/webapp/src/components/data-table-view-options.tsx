import type { Table } from "@tanstack/react-table";
import { Button } from "@theapp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@theapp/ui/components/dropdown-menu";
import { Settings01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import type { ComponentPropsWithoutRef } from "react";

export function DataTableViewOptions<TData>({
  table,
  labelsMap = {},
  ...props
}: {
  table: Table<TData>;
  labelsMap?: Record<string, string>;
} & ComponentPropsWithoutRef<typeof Button>) {
  "use no memo";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button {...props}>
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
            <span>Columns</span>
          </Button>
        }
      />
      <DropdownMenuContent className="w-max">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide(),
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {labelsMap[column.id] || column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
