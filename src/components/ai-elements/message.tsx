"use client";

import type { UIMessage } from "ai";
import { Streamdown, type StreamdownProps } from "streamdown";
import type { ComponentProps, HTMLAttributes } from "react";
import { memo } from "react";

import { streamdownComponents } from "./streamdown";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-3",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export function MessageContent({
  children,
  className,
  ...props
}: MessageContentProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-3 text-sm",
        "group-[.items-end]:w-fit group-[.items-end]:max-w-[85%] group-[.items-end]:rounded-[24px] group-[.items-end]:bg-primary group-[.items-end]:px-4 group-[.items-end]:py-3 group-[.items-end]:text-primary-foreground",
        "group-[.items-start]:w-full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type MessageActionsProps = ComponentProps<"div">;

export function MessageActions({
  className,
  children,
  ...props
}: MessageActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export type MessageActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

export function MessageAction({
  tooltip,
  label,
  className,
  children,
  variant = "ghost",
  size = "icon",
  ...props
}: MessageActionProps) {
  const button = (
    <Button
      className={cn("size-8 rounded-md", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label ?? tooltip}</span>
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export type MessageResponseProps = StreamdownProps & {
  isAnimating?: boolean;
};

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      className={cn(
        "size-full break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      components={streamdownComponents}
      {...props}
    />
  ),
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.isAnimating === nextProps.isAnimating,
);

MessageResponse.displayName = "MessageResponse";

export type MessageToolbarProps = ComponentProps<"div">;

export function MessageToolbar({
  className,
  children,
  ...props
}: MessageToolbarProps) {
  return (
    <div
      className={cn("flex w-full items-center justify-between gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
