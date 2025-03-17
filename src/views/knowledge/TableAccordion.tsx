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
      <p>
        {t("knowledge.createdAt")}: {createdAt}
      </p>
      <p>
        {t("knowledge.lastUpdate")}: {updatedAt}
      </p>
      <p>
        {t("knowledge.source")}: {knowledge.source}
      </p>
      <p>
        {t("knowledge.tags")}: {knowledge.tags}
      </p>
      <p>
        {t("knowledge.permissions")}: {permission()}
      </p>
    </div>
  );
}
