import DataTable from "./DataTable";
import { useState } from "react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UploadFileDialog from "./UploadFileDialog";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";
import Columns from "./Columns";
import { Knowledge as KnowledgeType } from "@/api";
import PdfViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { t } from "i18next";
import useDownloadFile from "@/hooks/useDownloadFile";
import { useToast } from "@/hooks/use-toast";
import TagEditDialog from "@/views/knowledge/TagEditDialog";

export default function Knowledge() {
  const { allKnowledge } = useGetKnowledgeList();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPdfWithUuid, setShowPdfWithUuid] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const { downloadFile } = useDownloadFile();
  const [openTagEditDialogKnowledge, setOpenTagEditDialogKnowledge] =
    useState<KnowledgeType | null>(null);

  const onClickFile = (knowledge: KnowledgeType) => {
    if (!knowledge.label || !knowledge.id) return;

    const docType = knowledge.label.split(".").pop()?.toLowerCase();

    if (docType === "pdf") {
      setShowPdfWithUuid(knowledge.id);
      setPdfLoading(knowledge.label);
    } else {
      toast({
        variant: "default",
        title: "Download started",
        description: "The file download start automatically",
      });
      void downloadFile(knowledge.id, knowledge.label);
    }
  };

  return (
    <div className={`flex h-full mt-0 relative`}>
      <div className="container mx-auto py-10">
        <DataTable
          columns={Columns(onClickFile, setOpenTagEditDialogKnowledge)}
          data={allKnowledge}
        />
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

      <TagEditDialog
        knowledge={openTagEditDialogKnowledge}
        onClose={() => {
          setOpenTagEditDialogKnowledge(null);
        }}
      />

      {showPdfWithUuid && pdfLoading && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowPdfWithUuid(null);
              setPdfLoading(null);
            }}
          />
          <div className="shadow-lg transition-all duration-300 ease-in-out fixed right-0 top-0 h-full w-1/2 z-50">
            <Button
              onClick={() => {
                setShowPdfWithUuid(null);
                setPdfLoading(null);
              }}
              variant="ghost"
              className="absolute top-1.5 right-2 bg-secondary"
            >
              <p>{t("chatbot.pdf.closeButton")}</p>
              <X className="h-4 w-4" />
            </Button>
            <div
              className="overflow-auto h-full pt-12"
              style={{ height: "100vh" }}
            >
              <PdfViewer fileUuid={showPdfWithUuid} label={pdfLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
