import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { Check, Copy, CornerDownLeft, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/code-display-block";
import { ChatMessageRecord } from "@/api";
import { useTranslation } from "react-i18next";
import { getInitials } from "@/lib/getInitials";
import { useUserContext } from "@/services/UserContextService";
import { useToast } from "@/hooks/use-toast";
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";
import useAvailableModels from "@/hooks/api/useGetModelsApi";
import { useTheme } from "@/components/theme-provider";

interface ChatProps {
  messages: ChatMessageRecord[];
  handleSubmit: (prompt: string) => Promise<void>;
  currentSelectedModelId: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  lockSendPrompt: boolean;
}

export default function Chat({
  messages,
  handleSubmit,
  currentSelectedModelId,
  isLoading,
  isGenerating,
  lockSendPrompt,
}: Readonly<ChatProps>) {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { getModelProviderFromUid } = useAvailableModels();

  // Get current selected model provider to display logo when loading
  const currentSelectedModelProvider = getModelProviderFromUid(
    currentSelectedModelId,
  );

  const [promptInput, setPromptInput] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      const { offsetHeight, scrollHeight, scrollTop } = messagesRef.current;
      if (scrollHeight <= scrollTop + offsetHeight + 100) {
        messagesRef.current.scrollTo(0, scrollHeight);
      }
    }
  }, [messagesRef]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const promptSave = promptInput;
    setPromptInput("");
    await handleSubmit(promptSave);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !promptInput || lockSendPrompt) return;
      void onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value);
  };

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

  const handleCopyClick = (messageIndex: number) => {
    const message = messages[messageIndex];
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
    <div className="flex flex-col h-full mx-5 items-center justify-center ">
      <div
        className="flex-1 overflow-y-auto flex-grow flex items-center justify-center w-5/6"
        style={{ maxHeight: "calc(100vh - 225px)" }}
        ref={messagesRef}
      >
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full max-w-[70%] mx-auto my-auto bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-4 text-center ">
              <h1 className="font-bold">{t("chatbot.chat.newChat.title")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("chatbot.chat.newChat.text")}
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message: ChatMessageRecord, index) => (
            <ChatBubble
              key={message.timestamp ? message.timestamp : index}
              variant={message.type == "USER" ? "sent" : "received"}
            >
              {message.type == "USER" ? (
                <ChatBubbleAvatar
                  className="bg-secondary"
                  src={""}
                  fallback={getInitials(
                    user?.name ?? user?.name ?? "Anonymous",
                  )}
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
                        <Markdown
                          key={
                            message.timestamp
                              ? message.timestamp + index.toString()
                              : index
                          }
                          remarkPlugins={[remarkGfm]}
                        >
                          {part}
                        </Markdown>
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

                {message.type === "AI" && messages.length - 1 === index && (
                  <div className="flex items-center mt-1.5 gap-1">
                    {!isGenerating && (
                      <>
                        <button onClick={() => void handleRetryClick(index)}>
                          <RefreshCcw className="size-4 bg-transparent" />
                        </button>
                        <button
                          onClick={() => {
                            handleCopyClick(index);
                          }}
                        >
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
          ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="bg-secondary flex justify-center items-center"
                ImageClassName="invert size-7"
                src={getLogoFromModelProvider(currentSelectedModelProvider)}
                fallback={"AI"}
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
        <div ref={messagesRef}></div>
      </div>

      {/* Form and Footer fixed at the bottom */}
      <div className="w-5/6 pb-1 px-4 sticky bottom-3 left-0 right-0 bg-transparent">
        <form
          ref={formRef}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={onSubmit}
          className="relative rounded-2xl border bg-secondary focus-within:ring-1 focus-within:ring-secondary-foreground"
        >
          <ChatInput
            value={promptInput}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-2xl border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button
              disabled={!promptInput || isLoading || lockSendPrompt}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
