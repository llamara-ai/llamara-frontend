import useChatMessages from "@/hooks/useChatMessages";
import Chat from "./Chat";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PdfViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { t } from "i18next";
import { useIsMobile } from "@/hooks/useMobile";
import { useSidebar } from "@/components/ui/sidebar.tsx";
import usePreviousValue from "@/hooks/usePreviousValue.ts";
import { useWindowSize } from "usehooks-ts";

const COLLAPSE_SIDEBAR_BREAKPOINT = 1340;

export default function Chatbot() {
  const [pdfKnowledgeId, setPdfKnowledgeId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [autoCollapsedSidebar, setAutoCollapsedSidebar] = useState(false);

  const location = useLocation();
  const isMobile = useIsMobile();
  const { width } = useWindowSize({
    initializeWithValue: true,
    debounceDelay: 50,
  });
  const previouswidth = usePreviousValue<number>(width);
  const { open, setOpen } = useSidebar();

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
    setPdfKnowledgeId(null);
    setPdfFileName(null);
    void updateSessionId(null); // Reset session id
    void updateSessionId(sessionId);
  }, [location]);

  // collapse sidebar if PDF is opened and screen is resized to a smaller size
  useEffect(() => {
    if (!pdfKnowledgeId) return;
    if (
      open &&
      width < COLLAPSE_SIDEBAR_BREAKPOINT &&
      previouswidth >= COLLAPSE_SIDEBAR_BREAKPOINT
    ) {
      setOpen(false);
      setAutoCollapsedSidebar(true);
    } else if (
      !open &&
      autoCollapsedSidebar &&
      width >= COLLAPSE_SIDEBAR_BREAKPOINT &&
      previouswidth < COLLAPSE_SIDEBAR_BREAKPOINT
    ) {
      setOpen(true);
      setAutoCollapsedSidebar(false);
    }
  }, [width]);
  // collapse sidebar if screen is small and PDF is opened
  useEffect(() => {
    if (!pdfKnowledgeId) return;
    if (open && width < COLLAPSE_SIDEBAR_BREAKPOINT) {
      setOpen(false);
      setAutoCollapsedSidebar(true);
    }
  }, [pdfKnowledgeId]);

  const onSubmit = async (prompt: string) => {
    await handlePromptAndMessages(prompt);
  };

  return (
    <div className="flex h-full mt-0 justify-center">
      <div
        className={`flex-shrink transition-all duration-300 ${pdfKnowledgeId != null ? "mr-4" : "w-full lg:w-5/6"} h-full overflow-auto`}
      >
        <Chat
          messages={chatMessages}
          handleSubmit={onSubmit}
          isLoading={loading}
          isGenerating={loadingResponse}
          lockSendPrompt={false}
          openPdf={(uuid: string, label: string) => {
            setPdfKnowledgeId(uuid);
            setPdfFileName(label);
          }}
        />
      </div>
      {pdfKnowledgeId && pdfFileName && (
        <div className="relative w-1/2 shadow-lg transition-all duration-300 ease-in-out">
          <Button
            onClick={() => {
              setPdfKnowledgeId(null);
              setPdfFileName(null);
              if (autoCollapsedSidebar) {
                setOpen(true);
                setAutoCollapsedSidebar(false);
              }
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
            <PdfViewer
              fileUuid={pdfKnowledgeId}
              label={pdfFileName}
              collapseToolbarButtonsBreakpoint={open ? 1490 : 1240}
            />
          </div>
        </div>
      )}
    </div>
  );
}
