"use client";

import { memo } from "react";
import { cn } from "~/lib/utils";
import { Markdown } from "./markdown";

interface TextPartProps {
  role: "user" | "assistant" | string;
  text: string;
}

function splitMarkdownIntoBlocks(source: string): Array<string> {
  const lines = source.split("\n");
  const blocks: Array<string> = [];
  let buffer: Array<string> = [];
  let inFence = false;

  const flush = () => {
    if (buffer.length > 0) {
      blocks.push(buffer.join("\n"));
      buffer = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      if (!inFence) {
        flush();
        inFence = true;
        buffer.push(line);
      } else {
        buffer.push(line);
        flush();
        inFence = false;
      }
      continue;
    }

    if (!inFence && trimmed === "") {
      flush();
      continue;
    }

    buffer.push(line);
  }

  flush();
  return blocks.length === 0 ? [source] : blocks;
}

const MarkdownBlock = memo(
  function PureMarkdownBlock({ content }: { content: string }) {
    if (content.trim() === "") return null;
    return <Markdown>{content}</Markdown>;
  },
  (prev, next) => prev.content === next.content,
);

function PureTextPart({ role, text }: TextPartProps) {
  if (text.trim() === "") return null;

  const blocks = splitMarkdownIntoBlocks(text);

  return (
    <div
      data-testid="message-content"
      className={cn(
        "flex flex-col gap-4 w-full whitespace-pre-wrap break-words will-change-transform",
        role === "user"
          ? "bg-primary text-primary-foreground rounded-tl-4xl rounded-b-4xl border-primary px-4 py-1.5"
          : "bg-transparent border-none shadow-none w-full",
      )}
    >
      {blocks.map((block, index) => (
        <MarkdownBlock key={`${index}:${block.length}`} content={block} />
      ))}
    </div>
  );
}

export const TextPart = memo(
  PureTextPart,
  (prevProps, nextProps) =>
    prevProps.text === nextProps.text && prevProps.role === nextProps.role,
);
