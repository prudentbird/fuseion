"use client";

import { cn } from "~/lib/utils";
import { unified } from "unified";
import { Markdown } from "./markdown";
import { memo, useMemo } from "react";
import { remarkPlugins } from "~/lib/markdown-plugins";

interface TextPartProps {
  role: "user" | "assistant" | string;
  text: string;
}

function splitMarkdownIntoBlocks(markdown: string): string[] {
  try {
    const processor = unified().use(remarkParse).use(remarkPlugins as any);

    const tree: any = processor.parse(markdown);
    const children: Array<any> = Array.isArray(tree.children)
      ? tree.children
      : [];

    const blocks: string[] = [];

    // Precompute line start offsets for fallback when `offset` is missing.
    const lineStartOffsets: number[] = [0];
    for (let i = 0; i < markdown.length; i++) {
      if (markdown[i] === "\n") lineStartOffsets.push(i + 1);
    }

    const toOffset = (line?: number, column?: number): number | undefined => {
      if (
        typeof line === "number" &&
        line >= 1 &&
        typeof column === "number" &&
        column >= 1 &&
        line - 1 < lineStartOffsets.length
      ) {
        return lineStartOffsets[line - 1] + (column - 1);
      }
      return undefined;
    };

    for (const node of children) {
      let start: number | undefined = node?.position?.start?.offset;
      let end: number | undefined = node?.position?.end?.offset;

      if (start === undefined || end === undefined) {
        start = toOffset(node?.position?.start?.line, node?.position?.start?.column);
        end = toOffset(node?.position?.end?.line, node?.position?.end?.column);
      }

      if (typeof start === "number" && typeof end === "number") {
        const slice = markdown.slice(start, end);
        if (slice.trim() !== "") blocks.push(slice);
      }
    }

    return blocks.length > 0 ? blocks : [markdown];
  } catch {
    return [markdown];
  }
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

  const blocks = useMemo(() => splitMarkdownIntoBlocks(text), [text]);

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
