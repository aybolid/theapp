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
import { cn } from "@theapp/ui/lib/utils";
import type { ComponentPropsWithoutRef, FC } from "react";

export const DataTableViewOptions: FC<
  {
    table: Table<unknown>;
    labelsMap?: Record<string, string>;
  } & ComponentPropsWithoutRef<typeof Button>
> = ({ table, labelsMap = {}, ...props }) => {
  "use no memo";

  const columns = table.getAllColumns().filter((column) => column.getCanHide());

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
          {columns.map((column) => {
            const label = labelsMap[column.id];
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                className={cn(!label && "text-destructive")}
              >
                {label || column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
