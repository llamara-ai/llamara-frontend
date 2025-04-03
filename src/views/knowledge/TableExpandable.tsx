import { KnowledgeRecord } from "@/api";
import { formatDate } from "date-fns";
import { translateUser, translatePermissions } from "./KnowledgePermissions";
import { t } from "i18next";

interface TableAccordionProps {
  knowledge: KnowledgeRecord;
}

export default function TableAccordion({
  knowledge,
}: Readonly<TableAccordionProps>) {
  if (!knowledge.createdAt || !knowledge.lastUpdatedAt) {
    return;
  }

  const listOfPermissionKeys = () => {
    return knowledge.permissions ? Object.keys(knowledge.permissions) : [];
  };

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
        <span className="w-3/4">
          {listOfPermissionKeys().map((key, index) => {
            return (
              <span key={key}>
                <span className="font-semibold">{translateUser(key)}: </span>
                <span>
                  {knowledge.permissions
                    ? translatePermissions(knowledge.permissions[key])
                    : ""}{" "}
                  {listOfPermissionKeys().length - 1 > index && <>|</>}{" "}
                </span>
              </span>
            );
          })}
        </span>
      </p>
    </div>
  );
}
