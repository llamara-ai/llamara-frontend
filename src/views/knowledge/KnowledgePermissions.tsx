import { Knowledge, Permission } from "@/api";
import { useUserContext } from "@/services/UserContextService";
import { useTranslation } from "react-i18next";

export default function KnowledgePermissions(
  knowledge: Readonly<Knowledge | undefined>,
) {
  const { t } = useTranslation();
  const { user } = useUserContext();

  if (!knowledge?.permissions || !user?.username) {
    return (
      <div className="ml-4">
        {t("knowledgePage.table.permission.undefined")}
      </div>
    );
  }

  return (
    <div className="ml-4">
      {translatePermissions(knowledge.permissions[user.username])}
    </div>
  );
}

export function translatePermissions(permission: Permission) {
  const { t } = useTranslation();
  switch (permission) {
    case "OWNER":
      return t("knowledgePage.table.permission.owner");
    case "READWRITE":
      return t("knowledgePage.table.permission.readwrite");
    case "READONLY":
      return t("knowledgePage.table.permission.readonly");

    case "NONE":
    default:
      return t("knowledgePage.table.permission.none");
  }
}
