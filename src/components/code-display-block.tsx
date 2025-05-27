"use client";
import React from "react";
import { Button } from "./ui/button";
import { Check, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/components/theme-provider.tsx";

interface ButtonCodeblockProps {
  code: string;
  lang: string;
}

export default function CodeDisplayBlock({
  code,
  lang,
}: Readonly<ButtonCodeblockProps>) {
  const [isCopied, setIsCopied] = React.useState(false);

  const { theme } = useTheme();

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast.success("Code copied to clipboard!");
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
      <SyntaxHighlighter
        language={lang}
        style={theme === "dark" ? oneDark : oneLight}
        showLineNumbers={true}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
