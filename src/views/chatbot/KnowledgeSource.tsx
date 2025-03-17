import { useTranslation } from "react-i18next";
import useGetKnowledgeApi from "@/hooks/api/useGetKnowledgeApi";
import useDownloadFile from "@/hooks/useDownloadFile";
import { Knowledge, RagSourceRecord } from "@/api";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { KnowledgeSourceDetail } from "./KnowledgeSourceDetail";
import { useState } from "react";

interface KnowledgeSourceProps {
  knowledgeId: string | null;
  embeddingId: string | null;
  sources: RagSourceRecord[] | undefined;
  openPdf: (uuid: string, label: string) => void;
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
  const { downloadFile } = useDownloadFile();
  const [hoverProps, setHoverProps] = useState<HoverProps>({
    source: null,
    knowledge: null,
  });

  const { knowledge, error } = useGetKnowledgeApi({ uuid: knowledgeId });

  const getDocType = () => {
    if (knowledge?.label) {
      const splittedLabel = knowledge.label.split(".");
      return splittedLabel[splittedLabel.length - 1].toUpperCase();
    }
    return t("chatbot.chat.source.docTypeUnknown");
  };

  const handleFileSource = async (): Promise<void> => {
    if (!knowledgeId || error) return;

    const docType = knowledge?.label?.split(".").pop()?.toLowerCase();

    if (docType === "pdf") {
      openPdf(knowledgeId, knowledge?.label ?? "document");
      return;
    }
    await downloadFile(knowledgeId, knowledge?.label);
  };

  const sourceContent = sources?.find(
    (source) => source.embeddingId === embeddingId,
  );

  const handleHover = () => {
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
    <HoverCard>
      {knowledge?.label ? (
        <HoverCardTrigger onMouseEnter={handleHover}>
          <span
            onClick={() => void handleFileSource()}
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

      <KnowledgeSourceDetail hoverProps={hoverProps} />
    </HoverCard>
  );
}
