import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  CornerDownLeft,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/code-display-block";
import { ChatMessageRecord } from "@/api";
import { useTranslation } from "react-i18next";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

interface ChatProps {
  messages: ChatMessageRecord[]
  handleSubmit: (prompt: string) => Promise<void>
  isLoading: boolean,
  isGenerating: boolean,
  lockSendPrompt: boolean
}


export default function Chat({ messages, handleSubmit, isLoading, isGenerating, lockSendPrompt }: Readonly<ChatProps>) {
  const { t } = useTranslation();

  const [promptInput, setPromptInput] = useState<string>("");

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptInput(e.target.value);
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    console.log("Action clicked:", action, "Message index:", messageIndex);
    if (action === "Refresh") {
      try {
        await handleSubmit(messages[messageIndex].text ?? "");
      } catch (error) {
        console.error("Error reloading:", error);
      }
    }

    if (action === "Copy") {
      const message = messages[messageIndex];
      if (message && message.type === "AI" && message.text) {
        navigator.clipboard.writeText(message.text);
      }
    }
  };

  return ( 
    <div className="flex flex-col h-full mx-5 items-center justify-center ">
      <div className="flex-1 overflow-y-auto py-6 flex-grow flex items-center justify-center w-5/6">
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full max-w-[70%] mx-auto my-auto bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-4 text-center ">
              <h1 className="font-bold">{t("chatbot.chat.newChat.title")}</h1>
              <p className="text-muted-foreground text-sm">{t("chatbot.chat.newChat.text")}</p>
            </div>
          )}

          {/* Messages */}
          {messages?.map((message: ChatMessageRecord, index) => (
              <ChatBubble
                key={message.timestamp? message.timestamp : index}
                variant={message.type == "USER" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src=""
                  fallback={message.type == "USER" ? "👨🏽" : "🤖"}
                />
                <ChatBubbleMessage>
                  {message.text?.toString()
                    .split("```")
                    .map((part: string, index: number) => {
                      if (index % 2 === 0) {
                        return (
                          <Markdown key={`${message.timestamp}-${index}`} remarkPlugins={[remarkGfm]}>
                            {part}
                          </Markdown>
                        );
                      } else {
                        return (
                          <pre className="whitespace-pre-wrap pt-2" key={`${message.timestamp}-${index}`}>
                            <CodeDisplayBlock code={part} lang="" />
                          </pre>
                        );
                      }
                    })}

                  {message.type === "AI" &&
                    messages.length - 1 === index && (
                      <div className="flex items-center mt-1.5 gap-1">
                        {!isGenerating && (
                          <>
                            {ChatAiIcons.map((icon, iconIndex) => {
                              const Icon = icon.icon;
                              return (
                                <ChatBubbleAction
                                  variant="outline"
                                  className="size-5"
                                  key={`${icon.label}-${iconIndex}`}
                                  icon={<Icon className="size-3" />}
                                  onClick={() =>
                                    handleActionClick(icon.label, index)
                                  }
                                />
                              );
                            })}
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
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      {/* Form and Footer fixed at the bottom */}
      <div className="w-5/6 p-4 sticky bottom-3 left-0 right-0 bg-transparent ">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-2xl border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={promptInput}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-2xl bg-background border-0 shadow-none focus-visible:ring-0"
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


