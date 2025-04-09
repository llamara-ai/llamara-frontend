import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = (
  {
    className,
    ...props
  }: ChatInputProps
) => (<Textarea
  autoComplete="off"
  name="message"
  className={cn(
    "px-4 py-3 max-h-40 h-full text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center resize-none",
    className,
  )}
  {...props}
/>);
ChatInput.displayName = "ChatInput";

export { ChatInput };
