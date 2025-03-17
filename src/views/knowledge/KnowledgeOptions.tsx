import { Knowledge } from "@/api";
import useDeleteKnowledgeApi from "@/hooks/api/useDeleteKnowledgeApi";
import { DeleteIcon, FilePenIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import UploadFileDialog from "./UploadFileDialog";
import { useState } from "react";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";

export default function KnowledgeOptions(knowledge: Readonly<Knowledge>) {
  const { t } = useTranslation();
  const { handleDeleteKnowledge } = useDeleteKnowledgeApi();
  const { deleteLocalKnowledge } = useGetKnowledgeList();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //Function to handle the Deletion of a file
  async function handleFileDelete() {
    if (!knowledge.id) return;
    await handleDeleteKnowledge(knowledge.id);
    await deleteLocalKnowledge(knowledge);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {t("knowledgePage.options.actions")}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            void handleFileDelete();
          }}
        >
          <DeleteIcon className="mr-2 h-4 w-4" />
          {t("knowledgePage.options.delete")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <FilePenIcon className="mr-2 h-4 w-4" />
              {t("knowledgePage.options.update")}
            </DropdownMenuItem>
          </DialogTrigger>
          <UploadFileDialog
            knowledge={knowledge}
            onClose={() => {
              setIsDialogOpen(false);
            }}
            resetSelectedFiles={!isDialogOpen}
          />
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
