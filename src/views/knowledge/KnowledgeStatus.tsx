import { Knowledge } from "@/api";
import { CheckCircle2, CircleAlert, CircleMinus, CircleX } from "lucide-react";
import { useTranslation } from "react-i18next";

// Styles the ingestion status
export default function KnowledgeStatus(
  knowledge: Readonly<Knowledge | undefined>,
) {
  const { t } = useTranslation();

  const commonClasses = "inline-flex items-center rounded-full h-8 w-28";
  const iconClasses = "w-6 h-6 rounded-full mr-2";

  const statusConfig = {
    FAILED: {
      bgColor: "bg-red-200",
      textColor: "text-red-950",
      icon: <CircleX className={`${iconClasses} to-red-400 bg-red-400 `} />,
      text: t("knowledgePage.table.status.failed"),
    },
    SUCCEEDED: {
      bgColor: "bg-green-200",
      textColor: "text-green-950",
      icon: (
        <CheckCircle2 className={`${iconClasses} to-green-400 bg-green-400`} />
      ),
      text: t("knowledgePage.table.status.succeeded"),
    },
    PENDING: {
      bgColor: "bg-blue-200",
      textColor: "text-blue-950",
      icon: (
        <CircleAlert className={`${iconClasses} to-blue-200 bg-blue-300`} />
      ),
      text: t("knowledgePage.table.status.pending"),
    },
    undefined: {
      bgColor: "bg-gray-200",
      textColor: "text-gray-950",
      icon: (
        <CircleMinus className={`${iconClasses} to-gray-200 bg-gray-300`} />
      ),
      text: t("knowledgePage.table.status.unknown"),
    },
  };

  const { bgColor, textColor, icon, text } =
    statusConfig[knowledge?.ingestionStatus ?? "undefined"];

  return (
    <div className={`${commonClasses} ${bgColor} ${textColor}`}>
      <div className="w-8 flex justify-center ml-1">{icon}</div>
      <span className="font-medium text-sm">{text}</span>
    </div>
  );
}
