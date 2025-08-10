"use client";

import { memo } from "react";
import { Markdown } from "./markdown";

export interface MarkdownBlockProps {
  content: string;
}

function PureMarkdownBlock({ content }: MarkdownBlockProps) {
  if (content.trim() === "") return null;
  return <Markdown>{content}</Markdown>;
}

export const MarkdownBlock = memo(
  PureMarkdownBlock,
  (prev, next) => prev.content === next.content,
);
