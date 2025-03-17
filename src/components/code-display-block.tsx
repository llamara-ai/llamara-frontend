"use client";
import React from "react";
import { CodeBlock, dracula, github } from "react-code-blocks";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ClipboardCopy } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ButtonCodeblockProps {
  code: string;
  lang: string;
}

export default function CodeDisplayBlock({
  code,
}: Readonly<ButtonCodeblockProps>) {
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const { theme } = useTheme();

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Code copied to clipboard!",
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col   text-start  ">
      <Button
        onClick={copyToClipboard}
        variant="ghost"
        size="icon"
        className="h-5 w-5 absolute top-2 right-2"
      >
        {isCopied ? (
          <Check className="w-4 h-4 scale-100 transition-all" />
        ) : (
          <ClipboardCopy className="w-4 h-4 scale-100 transition-all" />
        )}
      </Button>
      <CodeBlock
        text={code}
        language="tsx"
        showLineNumbers={false}
        theme={theme === "dark" ? dracula : github}
      />
    </div>
  );
}
