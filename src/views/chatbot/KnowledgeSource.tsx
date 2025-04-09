import { useTranslation } from "react-i18next";
import useGetKnowledgeApi from "@/hooks/api/useGetKnowledgeApi";
import useDownloadFile from "@/hooks/useDownloadFile";
import { KnowledgeRecord, RagSourceRecord } from "@/api";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { KnowledgeSourceDetail } from "./KnowledgeSourceDetail";
import React, { useState } from "react";
import { useIsTouch } from "@/hooks/useIsTouch.ts";
import { useHandleClickOutside } from "@/hooks/useHandleClickOutside.ts";
import { openPdf } from "@/views/chatbot/Chat.tsx";
import { useIsMobile } from "@/hooks/useMobile.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";

interface KnowledgeSourceProps {
  knowledgeId: string | null;
  embeddingId: string | null;
  sources: RagSourceRecord[] | undefined;
  openPdf: openPdf;
}

export interface HoverProps {
  source: RagSourceRecord | null;
  knowledge: KnowledgeRecord | null;
}

export function KnowledgeSource({
  knowledgeId,
  embeddingId,
  sources,
  openPdf,
}: Readonly<KnowledgeSourceProps>) {
  const { t } = useTranslation();
  const isTouch = useIsTouch();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const ref = useHandleClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });
  const [hoverProps, setHoverProps] = useState<HoverProps>({
    source: null,
    knowledge: null,
  });

  const { downloadFile } = useDownloadFile();
  const { knowledge, error } = useGetKnowledgeApi({ uuid: knowledgeId });

  const getDocType = () => {
    if (knowledge?.label) {
      const splittedLabel = knowledge.label.split(".");
      return splittedLabel[splittedLabel.length - 1].toUpperCase();
    }
    return t("chatbot.chat.source.docTypeUnknown");
  };

  const sourceContent = sources?.find(
    (source) => source.embeddingId === embeddingId,
  );

  const handleFileSource = async (): Promise<void> => {
    if (!knowledgeId || error) return;

    const docType = knowledge?.label?.split(".").pop()?.toLowerCase();

    if (docType === "pdf") {
      openPdf(
        knowledgeId,
        knowledge?.label ?? "document",
        sourceContent?.page,
        sourceContent?.content,
      );
      return;
    }
    await downloadFile(knowledgeId, knowledge?.label);
  };

  const handleClick = () => {
    if (isTouch) {
      return;
    }
    void handleFileSource();
  };

  const handleTouch = () => {
    handleHover();
    setOpen(true);
  };

  const handleHover = (event?: React.MouseEvent) => {
    event?.preventDefault();
    setHoverProps({
      knowledge: knowledge ?? null,
      source: sourceContent ?? null,
    });
  };

  if (!knowledgeId || error) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium bg-foreground/5 text-red-600">
        {"Invalid Source. Cannot render source"}
      </span>
    );
  }

  if (isMobile) {
    return (
      <div ref={ref}>
        {knowledge?.label ? (
          <span
            onClick={handleTouch}
            onTouchStart={handleTouch}
            className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium text-secondary-foreground hover:bg-foreground/20 bg-foreground/5"
          >
            {getDocType()} | {knowledge.label}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium text-secondary-foreground hover:bg-foreground/20 bg-foreground/5">
            {getDocType()} | {t("chatbot.chat.source.loading")}
          </span>
        )}

        {open && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
              onClick={() => {
                setOpen(false);
              }}
            />
            <Card className="shadow-lg transition-all duration-300 ease-in-out fixed top-8 bottom-8 left-8 right-8 z-50 overflow-y-scroll">
              <CardContent className="p-6 items-center justify-center overflow-auto">
                <KnowledgeSourceDetail
                  onOpenFile={() => {
                    setOpen(false);
                    void handleFileSource();
                  }}
                  hoverProps={hoverProps}
                  onClose={() => {
                    setOpen(false);
                  }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={ref}>
      <HoverCard open={isTouch ? open : undefined}>
        {knowledge?.label ? (
          <HoverCardTrigger onMouseEnter={handleHover}>
            <span
              onClick={handleClick}
              onTouchStart={handleTouch}
              className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium text-secondary-foreground hover:bg-foreground/20 bg-foreground/5"
            >
              {getDocType()} | {knowledge.label}
            </span>
          </HoverCardTrigger>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium text-secondary-foreground hover:bg-foreground/20 bg-foreground/5">
            {getDocType()} | {t("chatbot.chat.source.loading")}
          </span>
        )}

        <HoverCardContent className="w-[500px] p-6 max-h-[450px] items-center justify-center overflow-auto">
          <KnowledgeSourceDetail
            onOpenFile={() => void handleFileSource()}
            hoverProps={hoverProps}
          />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
