import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCardContent } from "@/components/ui/hover-card";
import { formatDate } from "@/lib/formatDate";
import { t } from "i18next";
import { translatePermissions } from "../knowledge/KnowledgePermissions";
import { HoverProps } from "./KnowledgeSource";

interface KnowledgeCardProps {
  hoverProps: HoverProps;
}

export function KnowledgeSourceDetail({
  hoverProps,
}: Readonly<KnowledgeCardProps>) {
  const knowledge = hoverProps.knowledge;
  const sourceContent =
    hoverProps.source?.content ?? "No source content available";

  return (
    <HoverCardContent className="w-3/4 max-h-[450px] items-center justify-center overflow-auto">
      <Card className="w-full">
        <CardHeader>
          {knowledge && (
            <>
              <CardTitle className="underline">{knowledge.label}</CardTitle>
              <CardDescription>ID: {knowledge.id}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
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
                    {Object.entries(knowledge.permissions).map(
                      ([key, value]) => (
                        <li
                          key={key}
                        >{`${key}: ${translatePermissions(value, t)}`}</li>
                      ),
                    )}
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
        <CardFooter>
          <div className="flex flex-col items-start ">
            <h3 className="font-bold mb-2 underline">
              {t("knowledge.sourceContent")}
            </h3>
            <p className="text-sm whitespace-pre-wrap">{sourceContent}</p>
          </div>
        </CardFooter>
      </Card>
    </HoverCardContent>
  );
}
