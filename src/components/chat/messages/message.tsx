"use client";

import cx from "classnames";
import { cn } from "~/lib/utils";
import equal from "fast-deep-equal";
import { ChatMessage } from "~/types";
import { memo, useState } from "react";
import { MessageEditor } from "./editor";
import { MessageActions } from "./actions";
import type { UseChatHelpers } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from "~/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "~/components/ai-elements/reasoning";
// import { PreviewAttachment } from './attachment-preview';
// type FileUIPart = Extract<UIMessage['parts'][number], { type: 'file' }>;

const PurePreviewMessage = ({
  message,
  isLoading,
  regenerate,
  setMessages,
  requiresScrollPadding,
}: {
  isLoading: boolean;
  message: ChatMessage;
  requiresScrollPadding: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const reasoningParts = message.parts.filter(
    (part): part is Extract<(typeof message.parts)[number], { type: "reasoning" }> =>
      part.type === "reasoning" && part.text.trim().length > 0,
  );
  const reasoningText = reasoningParts.map((part) => part.text).join("\n\n");
  const lastPart = message.parts.at(-1);
  const isReasoningStreaming =
    isLoading && lastPart?.type === "reasoning" && reasoningText.length > 0;
  const textParts = message.parts.filter(
    (
      part,
    ): part is Extract<(typeof message.parts)[number], { type: "text" }> =>
      part.type === "text" && part.text.trim() !== "",
  );

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message w-full"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <Message from={message.role}>
          <MessageContent
            className={cn("flex flex-col gap-2 w-full", {
              "min-h-96":
                mode !== "edit" &&
                message.role === "assistant" &&
                requiresScrollPadding,
              "max-w-none": mode === "edit",
            })}
          >
            {mode === "edit" ? (
              <MessageEditor
                key={message.id}
                message={message}
                regenerate={regenerate}
                setMessages={setMessages}
                setMode={setMode}
              />
            ) : (
              <>
                {reasoningText ? (
                  <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
                    <ReasoningTrigger />
                    <ReasoningContent>{reasoningText}</ReasoningContent>
                  </Reasoning>
                ) : null}

                {textParts.map((part, index) => (
                  <MessageResponse
                    key={`message-${message.id}-part-${index}`}
                    className={cn(
                      message.role === "user"
                        ? "text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {part.text}
                  </MessageResponse>
                ))}
              </>
            )}
          </MessageContent>

          <MessageToolbar
            className={cn(
              "mt-1",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <MessageActions
              key={`action-${message.id}`}
              isLoading={isLoading}
              message={message}
              regenerate={regenerate}
              setMode={setMode}
            />
          </MessageToolbar>
        </Message>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;

    // During streaming, we want to always re-render to show real-time updates
    if (prevProps.isLoading || nextProps.isLoading) return false;

    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <Message from="assistant">
        <MessageContent className={cx("w-fit rounded-full border bg-muted px-4 py-3")}>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-zinc-500 animate-bounce" />
            <div
              className="size-2 rounded-full bg-zinc-500 animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="size-2 rounded-full bg-zinc-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </MessageContent>
      </Message>
    </motion.div>
  );
};
