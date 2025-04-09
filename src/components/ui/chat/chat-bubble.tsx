import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageLoading from "./message-loading";
import { Button, buttonVariants } from "../button";


// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[75%] md:max-w-[65%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  },
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariant> {}

const ChatBubble = (
  {
    className,
    variant,
    layout,
    children,
    ...props
  }: ChatBubbleProps
) => (<div
  className={cn(
    chatBubbleVariant({ variant, layout, className }),
    "relative group",
  )}
  {...props}
>
  {React.Children.map(children, (child) =>
    React.isValidElement(child) && typeof child.type !== "string"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ? React.cloneElement(child, {
          variant,
          layout,
        } as React.ComponentProps<typeof child.type>)
      : child,
  )}
</div>);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  ImageClassName?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
  ImageClassName
}) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" className={ImageClassName}/>
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

// ChatBubbleMessage
const chatBubbleMessageVariants = cva("px-4 py-2 md:p-4", {
  variants: {
    variant: {
      received:
        "bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg",
      sent: "bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

const ChatBubbleMessage = (
  {
    className,
    variant,
    layout,
    isLoading = false,
    children,
    ...props
  }: ChatBubbleMessageProps
) => (<div
  className={cn(
    chatBubbleMessageVariants({ variant, layout, className }),
    "break-words max-w-full whitespace-pre-wrap",
  )}
  {...props}
>
  {isLoading ? (
    <div className="flex items-center space-x-2">
      <MessageLoading />
    </div>
  ) : (
    children
  )}
</div>);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn("text-xs mt-2 text-right", className)} {...props}>
    {timestamp}
  </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = React.ComponentProps<"button"> & {
  icon: React.ReactNode;
} &
VariantProps<typeof buttonVariants> ;

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={className}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

interface ChatBubbleActionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  className?: string;
}

const ChatBubbleActionWrapper = (
  {
    ref,
    variant,
    className,
    children,
    ...props
  }: ChatBubbleActionWrapperProps & {
    ref: React.RefObject<HTMLDivElement>;
  }
) => (<div
  ref={ref}
  className={cn(
    "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
    variant === "sent"
      ? "-left-1 -translate-x-full flex-row-reverse"
      : "-right-1 translate-x-full",
    className,
  )}
  {...props}
>
  {children}
</div>);
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};
