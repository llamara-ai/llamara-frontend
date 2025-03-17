import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { Check, Copy, RefreshCcw } from "lucide-react";
import CodeDisplayBlock from "@/components/code-display-block";
import { getInitials } from "@/lib/getInitials";
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";
import React, { useState } from "react";
import { useUserContext } from "@/services/UserContextService";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { ChatMessageRecord } from "@/api";
import { useTheme } from "@/components/theme-provider";
import { KnowledgeSource } from "./KnowledgeSource";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const { theme } = useTheme();

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    if (message.type === "AI" && message.text) {
      setIsCopied(true);
      void navigator.clipboard.writeText(message.text);
      toast({
        title: t("chatbot.chat.copyMessage"),
      });
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    }
  };

  return (
    <ChatBubble
      variant={message.type == "USER" ? "sent" : "received"}
      className={className}
    >
      {message.type == "USER" ? (
        <ChatBubbleAvatar
          className="bg-secondary"
          src={""}
          fallback={getInitials(user?.name ?? user?.name ?? "Anonymous")}
        />
      ) : (
        <ChatBubbleAvatar
          className="bg-secondary flex justify-center items-center"
          ImageClassName={`size-7 ${theme === "dark" ? "invert" : ""}`}
          src={getLogoFromModelProvider(message.modelProvider)}
          fallback={"AI"}
        />
      )}

      <ChatBubbleMessage>
        {message.text
          ?.toString()
          .split("```")
          .map((part: string, index: number) => {
            if (index % 2 === 0) {
              return (
                <TextMessage
                  key={
                    message.timestamp
                      ? message.timestamp + index.toString()
                      : index
                  }
                  text={part}
                  openPdf={openPdf}
                />
              );
            } else {
              return (
                <pre
                  className="whitespace-pre-wrap pt-2"
                  key={
                    message.timestamp
                      ? message.timestamp + index.toString()
                      : index
                  }
                >
                  <CodeDisplayBlock code={part} lang="" />
                </pre>
              );
            }
          })}

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

interface TextMessageProps {
  text: string;
  openPdf: (uuid: string, label: string) => void;
}

function TextMessage({ text, openPdf }: Readonly<TextMessageProps>) {
  // Splitting the text at ``` markers
  const parts = text.split(/(```[\s\S]*?```)/);

  const customComponents: Components = {
    p: ({ children }) => (
      <CustomParagraph openPdf={openPdf}>{children}</CustomParagraph>
    ),
  };

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Extracting the content and language from the code block
          const [, lang, ...codeLines] = part.split("\n");
          const code = codeLines.slice(0, -1).join("\n"); // Remove the last line with ```
          return (
            <pre
              key={part.slice(0, 10) + index.toString()}
              className="whitespace-pre-wrap pt-2"
            >
              <CodeDisplayBlock code={code} lang={lang.trim()} />
            </pre>
          );
        } else {
          return (
            <Markdown
              key={part.slice(0, 10) + index.toString()}
              remarkPlugins={[remarkGfm]}
              components={customComponents}
            >
              {part}
            </Markdown>
          );
        }
      })}
    </>
  );
}

interface CustomParagraphProp {
  children: React.ReactNode;
  openPdf: (uuid: string, label: string) => void;
}

function CustomParagraph({ children, openPdf }: Readonly<CustomParagraphProp>) {
  const regex = /(\{[^}]*\})/g;
  const elements: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;

  // Convert children to a string, regardless of type
  const content = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (React.isValidElement(child) && "children" in child.props) {
        return React.Children.toArray(child)
          .map((c) => (typeof c === "string" ? c : ""))
          .join("");
      }
      return "";
    })
    .join("");

  content.replace(regex, (match: string, _: string, offset: number) => {
    if (offset > lastIndex) {
      elements.push(content.slice(lastIndex, offset));
    }

    elements.push(
      <KnowledgeSource key={offset} uuid={getUuid(match)} openPdf={openPdf} />,
    );
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }

  return <p>{elements}</p>;
}

const getUuid = (text: string): string | null => {
  try {
    const parsedObject: { knowledge_id?: string } = JSON.parse(text) as {
      knowledge_id?: string;
    };
    if (parsedObject.knowledge_id) {
      return parsedObject.knowledge_id;
    } else {
      throw new Error(
        "The field “knowledge_id” is missing in the JSON object.",
      );
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Text provide invalid source:", error.message);
    } else {
      console.error("Something went wrong:", (error as Error).message);
    }
  }
  return null;
};
