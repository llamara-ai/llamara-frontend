import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCardContent } from "@/components/ui/hover-card";
import { formatDate } from "@/lib/formatDate";
import {
  translatePermissions,
  translateUser,
} from "../knowledge/KnowledgePermissions";
import { HoverProps } from "./KnowledgeSource";
import { FileSymlink } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";

interface KnowledgeCardProps {
  onOpenFile: () => void;
  hoverProps: HoverProps;
}

export function KnowledgeSourceDetail({
  onOpenFile,
  hoverProps,
}: Readonly<KnowledgeCardProps>) {
  const { t } = useTranslation();
  const knowledge = hoverProps.knowledge;
  const sourceContent =
    hoverProps.source?.content ?? "No source content available";

  return (
    <HoverCardContent className="w-[500px] p-6 max-h-[450px] items-center justify-center overflow-auto">
      <CardHeader className="p-0 pb-4">
        {knowledge && (
          <div className="flex flex-row justify-between">
            <div>
              <CardTitle className="font-bold text-lg">
                {knowledge.label}
              </CardTitle>
            </div>
            <Button onClick={onOpenFile} className="h-10 w-10">
              <FileSymlink className="h-8 w-8" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 p-0">
        {knowledge && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h2 className="font-semibold">{t("knowledge.createdAt")}</h2>
                <p>{formatDate(knowledge.createdAt)}</p>
              </div>
              <div>
                <h3 className="font-semibold">{t("knowledge.lastUpdate")}</h3>
                <p>{formatDate(knowledge.lastUpdatedAt)}</p>
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
    </HoverCardContent>
  );
}
