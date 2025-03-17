import DataTable from "./DataTable";
import { useState } from "react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadFileDialog from "./UploadFileDialog";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";
import Columns from "./Columns";

export default function Knowledge() {
  const { allKnowledge } = useGetKnowledgeList();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable columns={Columns()} data={allKnowledge} />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <FloatingActionButton
            onClick={() => {
              setIsDialogOpen(true);
            }}
          />
        </DialogTrigger>
        <UploadFileDialog
          knowledge={null}
          onClose={() => {
            setIsDialogOpen(false);
          }}
          resetSelectedFiles={!isDialogOpen}
        />
      </Dialog>
    </>
  );
}
