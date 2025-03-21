import DataTable from "./DataTable";
import { useState } from "react";
import UploadFileDialog from "./dialog/UploadFileDialog";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";
import Columns from "./Columns";
import { Knowledge as KnowledgeType } from "@/api";
import PdfViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { t } from "i18next";
import useDownloadFile from "@/hooks/useDownloadFile";
import { useToast } from "@/hooks/use-toast";
import TagEditDialog from "@/views/knowledge/dialog/TagEditDialog";
import PermissionDialog from "./dialog/PermissionDialog";

export default function Knowledge() {
  const { allKnowledge } = useGetKnowledgeList();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [showPdfWithUuid, setShowPdfWithUuid] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const { downloadFile } = useDownloadFile();
  const [openTagEditDialogKnowledgeId, setOpenTagEditDialogKnowledgeId] =
    useState<string | null>(null);
  const [openPermissionDialogKnowledgeId, setOpenPermissionDialogKnowledgeId] =
    useState<string | null>(null);

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
    <div className="flex relative px-2 pb-8">
      <div className="container">
        <DataTable
          columns={Columns(
            onClickFile,
            setOpenTagEditDialogKnowledgeId,
            setOpenPermissionDialogKnowledgeId,
          )}
          data={allKnowledge}
          setUploadDialogOpen={setUploadDialogOpen}
        />
      </div>

      <UploadFileDialog
        knowledge={null}
        onClose={() => {
          setUploadDialogOpen(false);
        }}
        open={uploadDialogOpen}
      />

      <TagEditDialog
        knowledgeId={openTagEditDialogKnowledgeId}
        onClose={() => {
          setOpenTagEditDialogKnowledgeId(null);
        }}
      />

      <PermissionDialog
        knowledgeId={openPermissionDialogKnowledgeId}
        onClose={() => {
          setOpenPermissionDialogKnowledgeId(null);
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
