import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { useEffect, useRef } from "react";
import { ChatMessageRecord } from "@/api";
import { useTranslation } from "react-i18next";
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";
import { useTheme } from "@/components/theme-provider";
import ChatMessage from "./ChatMessage";
import PromptInput from "./PromptInput";
import { readSelectedModel } from "@/hooks/useLocalStorage";

interface ChatProps {
  messages: ChatMessageRecord[];
  handleSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  isGenerating: boolean;
  lockSendPrompt: boolean;
  openPdf: (uuid: string, label: string) => void;
}

export default function Chat({
  messages,
  handleSubmit,
  openPdf,
  isLoading,
  isGenerating,
  lockSendPrompt,
}: Readonly<ChatProps>) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      const { offsetHeight, scrollHeight, scrollTop } = messagesRef.current;
      if (scrollHeight <= scrollTop + offsetHeight + 100) {
        messagesRef.current.scrollTo(0, scrollHeight);
      }
    }
  }, [messagesRef]);

  const handleRetryClick = async (messageIndex: number) => {
    try {
      let index = messageIndex;
      while (messages[index].type !== "USER" && index > 0) {
        index--;
      }
      await handleSubmit(messages[index].text ?? "");
    } catch (error) {
      console.error("Error reloading:", error);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div
        className="flex-1 overflow-y-auto flex-grow flex items-center justify-center w-5/6"
        style={{ maxHeight: "calc(100vh - 190px)" }}
        ref={messagesRef}
      >
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full max-w-[70%] mx-auto my-auto bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-4 text-center">
              <h1 className="font-bold">{t("chatbot.chat.newChat.title")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("chatbot.chat.newChat.text")}
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message: ChatMessageRecord, index) => (
            <ChatMessage
              key={message.timestamp ?? index}
              message={message}
              isGenerating={isGenerating}
              handleRetryClick={() => {
                void handleRetryClick(index);
              }}
              showButtons={
                message.type === "AI" && messages.length - 1 === index
              }
              openPdf={openPdf}
              className={messages.length - 1 === index ? "mb-4" : ""}
            />
          ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="bg-secondary flex justify-center items-center"
                ImageClassName={`size-7 ${theme === "dark" ? "invert" : ""}`}
                src={getLogoFromModelProvider(readSelectedModel()?.provider)}
                fallback={"AI"}
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
        <div ref={messagesRef}></div>
      </div>

      {/* Form and Footer fixed at the bottom */}
      <PromptInput
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        isLoading={isLoading}
        lockSendPrompt={lockSendPrompt}
      />
    </div>
  );
}
