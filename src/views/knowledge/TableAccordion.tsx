import { Knowledge } from "@/api";
import { formatDate } from "date-fns";
import { useUserContext } from "@/services/UserContextService";
import { translatePermissions } from "./KnowledgePermissions";
import { t } from "i18next";

interface TableAccordionProps {
  knowledge: Knowledge;
}

export default function TableAccordion({
  knowledge,
}: Readonly<TableAccordionProps>) {
  const { user } = useUserContext();

  if (!knowledge.createdAt || !knowledge.lastUpdatedAt) {
    return;
  }
  function permission() {
    if (!knowledge.permissions || !user?.username) {
      return "";
    }

    let permissions = "";

    for (const key in knowledge.permissions) {
      if (knowledge.permissions.hasOwnProperty(key)) {
        const value = knowledge.permissions[key];
        const permission = translatePermissions(value, t);
        permissions += `${key}: ${permission},`;
      }
    }
    permissions = permissions.substring(0, permissions.length - 1);
    return permissions;
  }
  const createdAt = formatDate(knowledge.createdAt, "dd.MM yyyy HH:mm z");
  const updatedAt = formatDate(knowledge.lastUpdatedAt, "dd.MM yyyy HH:mm z");
  return (
    <div>
      <p className="flex py-1 pl-2">
        <span className="w-1/6 font-semibold">{t("knowledge.createdAt")}:</span>
        <span className="w-3/4">{createdAt}</span>
      </p>
      <p className="flex py-1 pl-2">
        <span className="w-1/6 font-semibold">
          {t("knowledge.lastUpdate")}:
        </span>
        <span className="w-3/4">{updatedAt}</span>
      </p>
      <p className="flex py-1 pl-2">
        <span className="w-1/6 font-semibold">{t("knowledge.source")}:</span>
        <span className="w-3/4">{knowledge.source}</span>
      </p>
      <p className="flex py-1 pl-2">
        <span className="w-1/6 font-semibold">{t("knowledge.tags")}:</span>
        <span className="w-3/4">
          {knowledge.tags ? knowledge.tags.join(", ") : ""}
        </span>
      </p>
      <p className="flex py-1 pl-2">
        <span className="w-1/6 font-semibold">
          {t("knowledge.permissions")}:
        </span>
        <span className="w-3/4">{permission()}</span>
      </p>
    </div>
  );
}
