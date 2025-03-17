import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  ExpandedState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableAccordion from "./TableAccordion";

import { Input } from "@/components/ui/input";

import React, { useState } from "react";
import { Knowledge } from "@/api";
import { t } from "i18next";
import { DataTablePagination } from "./Pagination";

interface DataTableProps {
  columns: ColumnDef<Knowledge, Knowledge>[];
  data: Knowledge[];
}

export default function DataTable({ columns, data }: Readonly<DataTableProps>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "label",
      desc: false,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: () => true,
    state: {
      sorting,
      columnFilters,
      expanded: expanded,
    },
    onExpandedChange: setExpanded,
  });
  return (
    <>
      {/* Table */}
      <div>
        {/* Search */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter Label..."
            value={(table.getColumn("label")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("label")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow className="bg-secondary hover:bg-secondary">
                        <TableCell colSpan={columns.length}>
                          <TableAccordion knowledge={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("knowledgePage.table.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pigination in extra file*/}
      <div className="pt-2">{DataTablePagination(table)}</div>
    </>
  );
}
