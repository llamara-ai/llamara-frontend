import useChatMessages from "@/hooks/useChatMessages";
import Chat from "./Chat";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import PdfViewer from "@/components/pdf-viewer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { t } from "i18next";
import { useIsMobile } from "@/hooks/useMobile";
import { useSidebar } from "@/components/ui/sidebar.tsx";
import usePreviousValue from "@/hooks/usePreviousValue.ts";
import { useWindowSize } from "usehooks-ts";
import { useKeepAliveSession } from "@/hooks/useKeepAliveSession";
import { useGetSessions } from "@/services/GetSessionsService";

const COLLAPSE_SIDEBAR_BREAKPOINT = 1340;

export default function Chatbot() {
  const [pdfKnowledgeId, setPdfKnowledgeId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [initialPdfPage, setInitialPdfPage] = useState<number | undefined>(
    undefined,
  );
  const [initialPdfHighlightQuery, setInitialPdfHighlightQuery] = useState<
    string | undefined
  >(undefined);
  const [autoCollapsedSidebar, setAutoCollapsedSidebar] = useState(false);
  const { setActiveSessionId } = useGetSessions();
  useKeepAliveSession();

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
    loadingHistory,
    loadingResponse,
    handlePromptAndMessages,
  } = useChatMessages();

  // Set active session id from URL at load time
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session");
    setPdfKnowledgeId(null);
    setPdfFileName(null);
    setActiveSessionId(sessionId);
  }, []);

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
    <div className="flex h-full pt-[var(--header-height)] xl:pt-1 justify-center">
      <div
        className={`shrink transition-all duration-300 ${pdfKnowledgeId != null ? "mr-4" : "w-full lg:w-5/6"} h-full overflow-auto`}
      >
        <Chat
          messages={chatMessages}
          handleSubmit={onSubmit}
          isLoading={loadingHistory}
          isGenerating={loadingResponse}
          lockSendPrompt={false}
          openPdf={(
            uuid: string,
            label: string,
            initialPage?: number,
            initialHighlightQuery?: string,
          ) => {
            setPdfKnowledgeId(uuid);
            setPdfFileName(label);
            setInitialPdfPage(initialPage);
            setInitialPdfHighlightQuery(initialHighlightQuery);
          }}
        />
      </div>
      {pdfKnowledgeId && pdfFileName && (
        <div
          className="relative w-1/2 shadow-lg transition-all duration-300 ease-in-out"
          style={{
            marginTop: "var(--header-height)",
          }}
        >
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
            className="fixed top-1.5 right-2 z-50 bg-secondary mr-2"
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
            style={{
              height:
                "calc(100dvh - var(--header-height) - var(--footer-height) - 36px)",
            }}
          >
            <PdfViewer
              fileUuid={pdfKnowledgeId}
              label={pdfFileName}
              initialPage={initialPdfPage}
              initialHighlightQuery={initialPdfHighlightQuery}
              collapseToolbarButtonsBreakpoint={open ? 1490 : 1240}
            />
          </div>
        </div>
      )}
    </div>
  );
}
