import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  translatePermissions,
  translateUser,
} from "../knowledge/KnowledgePermissions";
import { HoverProps } from "./KnowledgeSource";
import { FileSymlink, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";

interface KnowledgeCardProps {
  onOpenFile: () => void;
  hoverProps: HoverProps;
  onClose?: () => void;
}

export function KnowledgeSourceDetail({
  onOpenFile,
  hoverProps,
  onClose,
}: Readonly<KnowledgeCardProps>) {
  const { t } = useTranslation();
  const knowledge = hoverProps.knowledge;
  const sourceContent =
    hoverProps.source?.content ?? "No source content available";

  return (
    <>
      <CardHeader className="p-0 pb-4">
        {knowledge && (
          <div className="flex flex-row justify-between">
            <div>
              <CardTitle className="font-bold text-lg">
                {knowledge.label}
              </CardTitle>
            </div>
            <div className="flex flex-row gap-2">
              <Button onClick={onOpenFile} className="h-10 w-10">
                <FileSymlink className="h-8 w-8" />
              </Button>
              {onClose && (
                <Button onClick={onClose} className="h-10 w-10">
                  <X className="h-8 w-8" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 p-0">
        {knowledge && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h2 className="font-semibold">{t("knowledge.createdAt")}</h2>
                <p>{knowledge.createdAt?.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">{t("knowledge.lastUpdate")}</h3>
                <p>{knowledge.lastUpdatedAt?.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                {t("knowledge.permissions")}
              </h3>
              {knowledge.permissions ? (
                <ul className="list-disc pl-5">
                  {Object.entries(knowledge.permissions).map(([key, value]) => (
                    <li
                      key={key}
                    >{`${translateUser(key)}: ${translatePermissions(value)}`}</li>
                  ))}
                </ul>
              ) : (
                <p>{t("knowledge.noPermissions")}</p>
              )}
            </div>
            <div>
              <h2 className="font-semibold mb-2">{t("knowledge.tags")}</h2>
              <div className="flex flex-wrap gap-2">
                {knowledge.tags && knowledge.tags.length > 0 ? (
                  knowledge.tags.map((tag, index) => (
                    <Badge key={tag + index.toString()} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p>{t("knowledge.noTags")}</p>
                )}
              </div>
            </div>
          </>
        )}
        <hr />
      </CardContent>
      <CardFooter className="p-0 pt-4">
        <div className="flex flex-col items-start">
          <div className="flex flex-col mb-2">
            <h3 className="font-bold leading-tight">
              {t("knowledge.sourceContent")}
            </h3>
            {hoverProps.source?.page && (
              <p className="text-sm text-muted-foreground">
                {t("chatbot.chat.source.page") +
                  ": " +
                  hoverProps.source.page.toString()}
              </p>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{sourceContent}</p>
        </div>
      </CardFooter>
    </>
  );
}
