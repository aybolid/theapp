import { flexRender, type Table as TTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@theapp/ui/components/table";
import { cn } from "@theapp/ui/lib/utils";
import type { FC, ReactNode } from "react";

export const DataTable: FC<{
  table: TTable<unknown>;
  className?: string;
  caption?: ReactNode;
}> = ({ table, className, caption }) => {
  "use no memo";

  const headerGroups = table.getHeaderGroups();
  const rows = table.getCoreRowModel().rows ?? [];
  const columns = table.getAllColumns();

  return (
    <div className={cn("overflow-hidden", className)}>
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => {
              const isSelected = row.getIsSelected();
              const cells = row.getVisibleCells();
              return (
                <TableRow
                  className="group/row"
                  key={row.id}
                  data-state={isSelected && "selected"}
                >
                  {cells.map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
