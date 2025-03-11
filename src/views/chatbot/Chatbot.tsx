import useChatMessages from "@/hooks/useChatMessages";
import Chat from "./Chat";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PdfViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { t } from "i18next";
import { useIsMobile } from "@/hooks/useMobile";

export default function Chatbot() {
  const [showPdfWithUuid, setShowPdfWithUuid] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const location = useLocation();
  const isMobile = useIsMobile();

  const {
    chatMessages,
    loading,
    loadingResponse,
    handlePromptAndMessages,
    updateSessionId,
  } = useChatMessages();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session");
    setShowPdfWithUuid(null);
    setPdfLoading(null);
    void updateSessionId(null); // Reset session id
    void updateSessionId(sessionId);
  }, [location]);

  const onSubmit = async (prompt: string) => {
    await handlePromptAndMessages(prompt);
  };

  return (
    <div className="flex h-full mt-0">
      <div
        className={`flex-1 transition-all duration-300 ${showPdfWithUuid ? "w-1/2" : "w-full"} h-full overflow-auto`}
      >
        <Chat
          messages={chatMessages}
          handleSubmit={onSubmit}
          isLoading={loading}
          isGenerating={loadingResponse}
          lockSendPrompt={false}
          openPdf={(uuid: string, label: string) => {
            setShowPdfWithUuid(uuid);
            setPdfLoading(label);
          }}
        />
      </div>
      {showPdfWithUuid && pdfLoading && (
        <div className="relative w-1/2 shadow-lg transition-all duration-300 ease-in-out">
          <Button
            onClick={() => {
              setShowPdfWithUuid(null);
              setPdfLoading(null);
            }}
            variant="ghost"
            className="fixed top-1.5 right-2 z-50 bg-secondary"
          >
            <p>{t("chatbot.pdf.closeButton")}</p>
            <X className="h-4 w-4" />
          </Button>
          <div
            className={
              isMobile
                ? "fixed overflow-auto h-full right-0 top-12"
                : "overflow-auto z-40"
            }
            style={{ height: "calc(100vh - 104px)" }}
          >
            <PdfViewer fileUuid={showPdfWithUuid} label={pdfLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
