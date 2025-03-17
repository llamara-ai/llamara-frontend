import { ColumnDef } from "@tanstack/react-table";
import { Knowledge } from "@/api";
import { ArrowUpDown, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import KnowledgeOptions from "./KnowledgeOptions";
import KnowledgeStatus from "./KnowledgeStatus";
import { useTranslation } from "react-i18next";
import KnowledgePermissions from "./KnowledgePermissions";

//Defines the columns of the data table.
export default function Columns(
  onClickFile: (knowledge: Knowledge) => void,
  onClickTagEdit: (knowledgeId: string | null) => void,
  onClickPermissionEdit: (knowledgeId: string | null) => void,
): ColumnDef<Knowledge>[] {
  const { t } = useTranslation();

  return [
    // Left most column
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <div className="w-auto">
            <Button
              variant="ghost"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc", true);
              }}
            >
              {t("knowledgePage.table.permission.label")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const knowledge = row.original;
        return KnowledgePermissions(knowledge);
      },
    },
    {
      accessorKey: "ingestionStatus",
      header: ({ column }) => {
        return (
          <div className="w-auto">
            <Button
              variant="ghost"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc", true);
              }}
            >
              {t("knowledgePage.table.status.label")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const knowledge = row.original;
        return KnowledgeStatus(knowledge);
      },
    },

    {
      //DropDown Menu Column
      id: "actions",
      cell: ({ row }) => {
        const knowledge = row.original;
        return KnowledgeOptions({
          knowledge,
          onClickTagEdit,
          onClickPermissionEdit,
        });
      },
    },
  ];
}
