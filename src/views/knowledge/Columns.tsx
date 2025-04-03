import type { Column, ColumnDef } from "@tanstack/react-table";
import type { KnowledgeRecord } from "@/api";
import {
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KnowledgeOptions from "./KnowledgeOptions";
import KnowledgeStatus from "./KnowledgeStatus";
import { useTranslation } from "react-i18next";
import KnowledgePermissions from "./KnowledgePermissions";

export default function Columns(
  onClickFile: (knowledge: KnowledgeRecord) => void,
  onClickTagEdit: (knowledgeId: string | null) => void,
  onClickPermissionEdit: (knowledgeId: string | null) => void,
): ColumnDef<KnowledgeRecord>[] {
  const { t } = useTranslation();

  return [
    {
      id: "collapseable",
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <Button
            onClick={row.getToggleExpandedHandler()}
            className="bg-secondary text-primary hover:text-secondary"
          >
            {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
          </Button>
        ) : (
          ""
        );
      },
    },
    {
      accessorKey: "label",
      header: ({ column, table }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              // Clear other column sorting when this column is sorted
              table.getAllColumns().forEach((col) => {
                if (col.id !== column.id) {
                  col.clearSorting();
                }
              });
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.label")}
            {SortingButton(column)}
          </Button>
        );
      },
      cell: ({ row }) => {
        const knowledge = row.original;
        return (
          <Button
            variant="ghost"
            onClick={() => {
              onClickFile(knowledge);
            }}
          >
            {knowledge.label}
          </Button>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: ({ column, table }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              // Clear other column sorting when this column is sorted
              table.getAllColumns().forEach((col) => {
                if (col.id !== column.id) {
                  col.clearSorting();
                }
              });
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.permission.label")}
            {SortingButton(column)}
          </Button>
        );
      },
      cell: ({ row }) => {
        const knowledge = row.original;
        return <KnowledgePermissions knowledge={knowledge} />;
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.permissions;
        const b = rowB.original.permissions;
        return (typeof a === "string" ? a : "").localeCompare(
          typeof b === "string" ? b : "",
        );
      },
    },
    {
      accessorKey: "ingestionStatus",
      header: ({ column, table }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              // Clear other column sorting when this column is sorted
              table.getAllColumns().forEach((col) => {
                if (col.id !== column.id) {
                  col.clearSorting();
                }
              });
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.status.label")}
            {SortingButton(column)}
          </Button>
        );
      },
      cell: ({ row }) => {
        const knowledge = row.original;
        return <KnowledgeStatus knowledge={knowledge} />;
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.ingestionStatus;
        const b = rowB.original.ingestionStatus;
        return (a ?? "").localeCompare(b ?? "");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const knowledge = row.original;
        return (
          <KnowledgeOptions
            knowledge={knowledge}
            onClickTagEdit={onClickTagEdit}
            onClickPermissionEdit={onClickPermissionEdit}
          />
        );
      },
    },
  ];
}

// Show sorting button based on the column sorting state
// ArrowUpDown if the column is not sorted
const SortingButton = (column: Column<KnowledgeRecord>) => {
  if (column.getIsSorted() === "asc") {
    return <ArrowUp className="ml-2 h-4 w-4" />;
  } else if (column.getIsSorted() === "desc") {
    return <ArrowDown className="ml-2 h-4 w-4" />;
  } else {
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
};
