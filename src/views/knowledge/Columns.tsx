import type { ColumnDef } from "@tanstack/react-table";
import type { Knowledge } from "@/api";
import { ArrowUp, ArrowDown, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import KnowledgeOptions from "./KnowledgeOptions";
import KnowledgeStatus from "./KnowledgeStatus";
import { useTranslation } from "react-i18next";
import KnowledgePermissions from "./KnowledgePermissions";

export default function Columns(
  onClickFile: (knowledge: Knowledge) => void,
  onClickTagEdit: (knowledgeId: string | null) => void,
  onClickPermissionEdit: (knowledgeId: string | null) => void,
): ColumnDef<Knowledge>[] {
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.label")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDown className="ml-2 h-4 w-4" />
            )}
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.permission.label")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDown className="ml-2 h-4 w-4" />
            )}
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            {t("knowledgePage.table.status.label")}
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ArrowDown className="ml-2 h-4 w-4" />
            )}
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
