import { useTranslation } from "react-i18next";
import useGetKnowledgeApi from "@/hooks/api/useGetKnowledgeApi";
import useDownloadFile from "@/hooks/useDownloadFile";
import { Knowledge, RagSourceRecord } from "@/api";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { KnowledgeSourceDetail } from "./KnowledgeSourceDetail";
import React, { useState } from "react";
import { useIsTouch } from "@/hooks/useIsTouch.ts";
import { useHandleClickOutside } from "@/hooks/useHandleClickOutside.ts";
import { openPdf } from "@/views/chatbot/Chat.tsx";

interface KnowledgeSourceProps {
  knowledgeId: string | null;
  embeddingId: string | null;
  sources: RagSourceRecord[] | undefined;
  openPdf: openPdf;
}

export interface HoverProps {
  source: RagSourceRecord | null;
  knowledge: Knowledge | null;
}

export function KnowledgeSource({
  knowledgeId,
  embeddingId,
  sources,
  openPdf,
}: Readonly<KnowledgeSourceProps>) {
  const { t } = useTranslation();
  const isTouch = useIsTouch();
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
      openPdf(knowledgeId, knowledge?.label ?? "document", sourceContent?.page, sourceContent?.content);
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

  const handleTouch = (event: React.TouchEvent) => {
    event.preventDefault();
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

        <KnowledgeSourceDetail
          onOpenFile={() => void handleFileSource()}
          hoverProps={hoverProps}
        />
      </HoverCard>
    </div>
  );
}
