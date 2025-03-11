import React, { useEffect, useState } from "react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { Check, Copy, RefreshCcw } from "lucide-react";
import CodeDisplayBlock from "@/components/code-display-block";
import { getInitials } from "@/lib/getInitials";
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";
import { useUserContext } from "@/services/UserContextService";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type {
  ChatMessageRecord,
  ChatModelContainer,
  RagSourceRecord,
} from "@/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import useAvailableModels from "@/hooks/api/useGetModelsApi";
import { KnowledgeSource } from "./KnowledgeSource";

interface ChatMessageProps {
  message: ChatMessageRecord;
  isGenerating: boolean;
  handleRetryClick: () => void;
  openPdf: (uuid: string, label: string) => void;
  showButtons: boolean;
  className?: string;
}

export default function ChatMessage({
  message,
  isGenerating,
  handleRetryClick,
  openPdf,
  showButtons,
  className,
}: Readonly<ChatMessageProps>) {
  const { user } = useUserContext();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isCopied, setIsCopied] = useState(false);

  const { models } = useAvailableModels();

  const [usedModel, setUsedModel] = useState<ChatModelContainer | null>(null);

  useEffect(() => {
    for (const model of models) {
      if (model.uid === message.modelUID) {
        setUsedModel(model);
      }
    }
  }, [models]);

  const handleCopyClick = () => {
    if (message.type === "AI" && message.text) {
      void navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      toast({ title: t("chatbot.chat.copyMessage") });
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    }
  };

  const renderContent = () => {
    if (!message.text) return null;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            return match ? (
              <CodeDisplayBlock
                code={
                  typeof children === "string"
                    ? children.replace(/\n$/, "")
                    : ""
                }
                lang={match[1]}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <KnowledgeSourceRenderer
              openPdf={openPdf}
              sources={message.sources}
            >
              {children}
            </KnowledgeSourceRenderer>
          ),
          li: ({ children, ...props }) => (
            <li {...props}>
              <KnowledgeSourceRenderer
                openPdf={openPdf}
                sources={message.sources}
              >
                {children}
              </KnowledgeSourceRenderer>
            </li>
          ),
        }}
      >
        {message.text.replace(/\\n/g, "\n")}
      </ReactMarkdown>
    );
  };

  return (
    <ChatBubble
      variant={message.type === "USER" ? "sent" : "received"}
      className={className}
    >
      {message.type == "USER" ? (
        <ChatBubbleAvatar
          className="bg-secondary"
          src={""}
          fallback={getInitials(user?.name ?? user?.username ?? "Anonymous")}
        />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ChatBubbleAvatar
                className="bg-secondary flex justify-center items-center"
                ImageClassName={"size-7 dark:invert"}
                src={getLogoFromModelProvider(usedModel?.provider)}
                fallback={"AI"}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {usedModel?.label ?? t("chatbot.chat.modelNameNotAvailable")}
          </TooltipContent>
        </Tooltip>
      )}

      <ChatBubbleMessage>
        {renderContent()}
        {showButtons && (
          <div className="flex items-center mt-1.5 gap-1">
            {!isGenerating && (
              <>
                <button onClick={handleRetryClick}>
                  <RefreshCcw className="size-4 bg-transparent" />
                </button>
                <button onClick={handleCopyClick}>
                  {isCopied ? (
                    <Check className="size-4 bg-transparent scale-100 transition-all" />
                  ) : (
                    <Copy className="size-4 bg-transparent scale-100 transition-all" />
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </ChatBubbleMessage>
    </ChatBubble>
  );
}

interface KnowledgeSourceRendererProps {
  children: React.ReactNode;
  sources: RagSourceRecord[] | undefined;
  openPdf: (uuid: string, label: string) => void;
}

function KnowledgeSourceRenderer({
  children,
  sources,
  openPdf,
}: Readonly<KnowledgeSourceRendererProps>) {
  const renderContent = (content: string) => {
    // split by source references
    const parts = content.split(/(\{[^}]*})/g);

    return parts.map((part, index) => {
      // extract knowledge_id and embedding_id from source reference using named RegEx groups
      // the following RegEx allows optional spaces and optional quotes around keys
      const match =
        /{ ?"?knowledge_id"?: ?"(?<kid>[a-fA-F0-9-]{36})", ?"?embedding_id"?: ?"(?<eid>[a-fA-F0-9-]{36})" ?}/.exec(
          part,
        );
      if (match?.groups?.kid && match.groups.eid) {
        return (
          <KnowledgeSource
            key={match.groups.kid + index.toString()}
            knowledgeId={match.groups.kid}
            embeddingId={match.groups.eid}
            openPdf={openPdf}
            sources={sources}
          />
        );
      }
      return part;
    });
  };

  if (typeof children === "string") {
    return <>{renderContent(children)}</>;
  }

  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, index) => (
          <React.Fragment
            key={typeof child === "string" ? child + index.toString() : index}
          >
            {typeof child === "string" ? renderContent(child) : child}
          </React.Fragment>
        ))}
      </>
    );
  }

  return <>{children}</>;
}
