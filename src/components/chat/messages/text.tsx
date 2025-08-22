"use client";

import { memo } from "react";
import { cn } from "~/lib/utils";
import { Markdown } from "./markdown";

interface TextPartProps {
  role: "user" | "assistant" | string;
  text: string;
}

function PureTextPart({ role, text }: TextPartProps) {
  if (text.trim() === "") return null;

  return (
    <div
      data-testid="message-content"
      className={cn(
        "flex flex-col w-fit max-w-full gap-4 whitespace-pre-wrap break-words will-change-transform",
        role === "user"
          ? "bg-primary text-primary-foreground rounded-tl-4xl rounded-b-4xl border-primary px-4 py-1.5 self-end"
          : "bg-transparent border-none shadow-none self-start",
      )}
    >
      <Markdown>{text}</Markdown>
    </div>
  );
}

export const TextPart = memo(
  PureTextPart,
  (prevProps, nextProps) =>
    prevProps.text === nextProps.text && prevProps.role === nextProps.role,
);
