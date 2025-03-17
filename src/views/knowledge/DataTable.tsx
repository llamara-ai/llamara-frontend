import React, { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  type ExpandedState,
  type FilterFn,
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
import type { Knowledge } from "@/api";
import { t } from "i18next";
import { DataTablePagination } from "./Pagination";

interface DataTableProps {
  columns: ColumnDef<Knowledge>[];
  data: Knowledge[];
}

const globalFilterFn: FilterFn<Knowledge> = (row, _columnId, filterValue) => {
  const searchValue: string = String(filterValue).toLowerCase();
  const { tags, permissions, ...otherFields } = row.original;

  // Check visible columns
  const visibleMatch = Object.values(otherFields).some((value) =>
    String(value).toLowerCase().includes(searchValue),
  );

  // Check tags
  const tagMatch =
    tags?.some((tag) => tag.toLowerCase().includes(searchValue)) ?? false;

  const permissionMatch = permissions
    ? Object.entries(permissions).some(([key, permission]) => {
        const keyMatch = key.toLowerCase().includes(searchValue);
        const valueMatch = Object.values(permission).some((value) =>
          String(value).toLowerCase().includes(searchValue),
        );
        return keyMatch || valueMatch;
      })
    : false;
  return visibleMatch || tagMatch || permissionMatch;
};

export default function DataTable({ columns, data }: Readonly<DataTableProps>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "label", desc: false },
  ]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: () => true,
    globalFilterFn,
    state: {
      sorting,
      expanded,
      globalFilter,
    },
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <div>
        <div className="flex items-center py-4">
          <Input
            placeholder={t("knowledgePage.table.inputPlaceholder")}
            value={globalFilter}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
            }}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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

      <div className="pt-2">{DataTablePagination(table)}</div>
    </>
  );
}
