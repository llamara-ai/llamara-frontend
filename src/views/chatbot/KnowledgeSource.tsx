import { useTranslation } from "react-i18next";
import useGetKnowledgeApi from "@/hooks/api/useGetKnowledgeApi";
import useDownloadFile from "@/hooks/useDownloadFile";

interface KnowledgeSourceProps {
  uuid: string | null;
  openPdf: (uuid: string, label: string) => void;
}

export function KnowledgeSource({
  uuid,
  openPdf,
}: Readonly<KnowledgeSourceProps>) {
  const { t } = useTranslation();
  const { downloadFile } = useDownloadFile();

  const { knowledge, error } = useGetKnowledgeApi({ uuid });

  const getDocType = () => {
    if (knowledge?.label) {
      const splittedLabel = knowledge.label.split(".");
      return splittedLabel[splittedLabel.length - 1].toUpperCase();
    }
    return t("chatbot.chat.source.docTypeUnknown");
  };

  const handleFileSource = async (): Promise<void> => {
    if (!uuid || error) return;

    const docType = knowledge?.label?.split(".").pop()?.toLowerCase();

    if (docType === "pdf") {
      openPdf(uuid, knowledge?.label ?? "document");
      return;
    }
    await downloadFile(uuid, knowledge?.label);
  };

  return (
    <span>
      {!uuid || error ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium bg-foreground/5 text-red-600">
          {"Invalid Source. Cannot render source"}
        </span>
      ) : (
        <span
          onClick={() => void handleFileSource()}
          className="inline-flex items-center px-2 py-0.5 rounded border text-sm font-medium text-secondary-foreground hover:bg-foreground/20 bg-foreground/5"
        >
          {getDocType()} |{" "}
          {knowledge?.label
            ? knowledge.label
            : t("chatbot.chat.source.loading")}
        </span>
      )}
    </span>
  );
}
