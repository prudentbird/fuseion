"use client";

import { cn } from "~/lib/utils";
import { Markdown } from "./markdown";
import { memo, useMemo } from "react";
import { MarkdownBlock } from "./markdown-block";
import { splitMarkdownIntoBlocks } from "~/lib/markdown-lexer";

interface TextPartProps {
  role: "user" | "assistant" | string;
  text: string;
  isLoading: boolean;
}

function PureTextPart({ role, text, isLoading }: TextPartProps) {
  if (text.trim() === "") return null;

  const blocks = useMemo(() => splitMarkdownIntoBlocks(text), [text]);

  return (
    <div
      data-testid="message-content"
      className={cn(
        "flex flex-col gap-4 w-fit whitespace-pre-wrap break-words will-change-transform",
        role === "user"
          ? "bg-primary text-primary-foreground rounded-tl-4xl rounded-b-4xl border-primary px-4 py-1.5 self-end"
          : "bg-transparent border-none shadow-none self-start",
      )}
    >
      {isLoading ? (
        <div>
          {blocks.map((block, index) => (
            <MarkdownBlock key={`${index}:${block.length}`} content={block} />
          ))}
        </div>
      ) : (
        <Markdown>{text}</Markdown>
      )}
    </div>
  );
}

export const TextPart = memo(
  PureTextPart,
  (prevProps, nextProps) =>
    prevProps.text === nextProps.text && prevProps.role === nextProps.role,
);
