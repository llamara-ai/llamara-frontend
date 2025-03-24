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
import ChatMessage from "./ChatMessage";
import PromptInput from "./PromptInput";
import { readSelectedModel } from "@/hooks/useLocalStorage";
import { useIsMobile } from "@/hooks/useMobile";
import { useUserContext } from "@/services/UserContextService.tsx";

export type openPdf = (
  uuid: string,
  label: string,
  initialPage?: number,
  initialHighlightQuery?: string,
) => void;

interface ChatProps {
  messages: ChatMessageRecord[];
  handleSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  isGenerating: boolean;
  lockSendPrompt: boolean;
  openPdf: openPdf;
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
  const mobile = useIsMobile();
  const { user } = useUserContext();

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      const { offsetHeight, scrollHeight, scrollTop } = messagesRef.current;
      if (scrollHeight <= scrollTop + offsetHeight + 100) {
        messagesRef.current.scrollTo(0, scrollHeight);
      }
    }
  }, [messagesRef]);

  // autofocus on prompt input when not on mobile
  useEffect(() => {
    if (!mobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

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
    <div className="flex flex-col h-full items-center justify-between">
      <div className="overflow-y-auto w-full" ref={messagesRef}>
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full md:max-w-[70%] mx-auto lg:mt-12 bg-background shadow-sm border rounded-lg p-4 lg:p-8 flex flex-col gap-4 text-center">
              <h1 className="font-bold">
                {user?.name
                  ? t("chatbot.chat.newChat.title-personalized").replace(
                      "%s",
                      user.name.split(" ")[0],
                    )
                  : t("chatbot.chat.newChat.title")}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t("chatbot.chat.newChat.text.1")}
                <br />
                {t("chatbot.chat.newChat.text.2")}
                <br />
                {t("chatbot.chat.newChat.text.3")}
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
                (message.type === "AI" || message.type === "SYSTEM") &&
                messages.length - 1 === index
              }
              openPdf={openPdf}
            />
          ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received" className="mb-4">
              <ChatBubbleAvatar
                className="bg-secondary flex justify-center items-center"
                ImageClassName={"size-7 dark:invert"}
                src={getLogoFromModelProvider(readSelectedModel()?.provider)}
                fallback={"AI"}
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
        <div ref={messagesRef}></div>
      </div>

      <div className="w-full flex flex-col items-center justify-center">
        <PromptInput
          ref={inputRef}
          handleSubmit={handleSubmit}
          isGenerating={isGenerating}
          isLoading={isLoading}
          lockSendPrompt={lockSendPrompt}
        />
        <small className="block mt-2 text-xs text-muted-foreground text-center w-full pb-2">
          {t("footer.hint")}
        </small>
      </div>
    </div>
  );
}
