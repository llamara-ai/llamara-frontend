import { Knowledge, Permission } from "@/api";
import { useUserContext } from "@/services/UserContextService";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { USER_ANY } from "./dialog/PermissionDialog";

interface KnowledgePermissionsProps {
  knowledge: Readonly<Knowledge | undefined>;
}

export default function KnowledgePermissions({
  knowledge,
}: Readonly<KnowledgePermissionsProps>) {
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
      {translatePermissions(
        compareWithAnyPermission(knowledge.permissions, user.username),
      )}
    </div>
  );
}

// Compares user permission with any permission and returns the highest permission
export function compareWithAnyPermission(
  permissions: Record<string, Permission>,
  username: string,
): Permission {
  if (permissions[username] === "OWNER") {
    return "OWNER";
  } else if (
    permissions[username] === "READWRITE" ||
    permissions[USER_ANY] === "READWRITE"
  ) {
    return "READWRITE";
  } else if (
    permissions[username] === "READONLY" ||
    permissions[USER_ANY] === "READONLY"
  ) {
    return "READONLY";
  }
  return "NONE";
}

export function translatePermissions(permission: Permission) {
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
