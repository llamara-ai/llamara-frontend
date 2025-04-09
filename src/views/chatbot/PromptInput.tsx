import { ChatInput } from "@/components/ui/chat/chat-input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as React from "react";

interface PromptInputProps {
  handleSubmit: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  isLoading: boolean;
  lockSendPrompt: boolean;
}

const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ handleSubmit, isGenerating, isLoading, lockSendPrompt }) => {
    const { t } = useTranslation();
    const [promptInput, setPromptInput] = useState<string>("");

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      const promptSave = promptInput;
      setPromptInput("");
      e.preventDefault();
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
    return (
      <div className="w-full px-4 py-1 sticky bottom-3 left-0 right-0 bg-transparent">
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={onSubmit}
          className="relative flex items-center rounded-2xl border bg-secondary focus-within:ring-1 focus-within:ring-secondary-foreground"
        >
          <ChatInput
            value={promptInput}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder={t("chatbot.promptInput.placeholder")}
            className="grow rounded-2xl border-0 shadow-none focus-visible:ring-0"
          />
          <Button
            disabled={!promptInput || isLoading || lockSendPrompt}
            type="submit"
            size="sm"
            className="ml-auto gap-1.5 mx-2"
          >
            <SendHorizontal size={4} />
          </Button>
        </form>
      </div>
    );
  },
);
PromptInput.displayName = "PromptInput";

export default PromptInput;
