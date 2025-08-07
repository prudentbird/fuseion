"use client";

import cx from "classnames";
import equal from "fast-deep-equal";
import { Markdown } from "./markdown";
import { memo, useState } from "react";
import { ErrorMessage } from "./error";
import { MessageEditor } from "./editor";
import { MessageActions } from "./actions";
import { cn, sanitizeText } from "~/lib/utils";
import { MessageReasoning } from "./reasoning";
import { AnimatePresence, motion } from "framer-motion";
// import { PreviewAttachment } from './attachment-preview';
import type { UseChatHelpers, UIMessage } from "@ai-sdk/react";
import { ChatMessage } from "~/types";
import { useDataStream } from "../data-stream/provider";
import { ChatSDKError } from "~/lib/errors";
// type FileUIPart = Extract<UIMessage['parts'][number], { type: 'file' }>;

const PurePreviewMessage = ({
  error,
  message,
  isLoading,
  setMessages,
  regenerate,
  requiresScrollPadding,
}: {
  isLoading: boolean;
  message: ChatMessage;
  error: Error | undefined;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  requiresScrollPadding: boolean;
}) => {
  useDataStream();
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-[75%]",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          <div
            className={cn("flex flex-col gap-2 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {/* {message.parts?.filter((part): part is FileUIPart => part.type === 'file').length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {message.parts?.filter((part): part is FileUIPart => part.type === 'file').map((filePart) => (
                  <PreviewAttachment key={filePart.url} attachment={filePart} />
                ))}
              </div>
            )} */}

            {Array.isArray(message.parts) &&
              message.parts
                .filter((part) => part != null)
                .map((part, index) => {
                  const { type } = part;
                  const key = `message-${message.id}-part-${index}`;

                  if (type === "reasoning" && part.text?.trim().length > 0) {
                    return (
                      <MessageReasoning
                        key={key}
                        isLoading={isLoading}
                        reasoning={part.text}
                      />
                    );
                  }

                  if (type === "text") {
                    if (part.text.trim() === "") {
                      return null;
                    }

                    if (mode === "view") {
                      return (
                        <div
                          key={key}
                          data-testid="message-content"
                          className={cn(
                            "flex flex-col gap-4 w-full whitespace-pre-wrap break-words",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tl-4xl rounded-b-4xl border-primary px-4 py-1.5"
                              : "bg-transparent border-none shadow-none w-full",
                          )}
                        >
                          <Markdown>{sanitizeText(part.text)}</Markdown>
                        </div>
                      );
                    }

                    if (mode === "edit") {
                      return (
                        <div
                          key={key}
                          className="flex flex-row gap-2 items-start"
                        >
                          <div className="size-8" />
                          <MessageEditor
                            key={message.id}
                            message={message}
                            setMode={setMode}
                            setMessages={setMessages}
                            regenerate={regenerate}
                          />
                        </div>
                      );
                    }
                  }

                  // Handle file parts - they are already rendered above, so we skip them here
                  if (type === "file") {
                    return null;
                  }

                  // Handle other part types that might be added in the future
                  return null;
                })}
            {error && (
              <ErrorMessage
                error={
                  error instanceof ChatSDKError
                    ? error.message
                    : "Something went wrong"
                }
              />
            )}

            {
              <MessageActions
                key={`action-${message.id}`}
                setMode={setMode}
                message={message}
                isLoading={isLoading}
                regenerate={regenerate}
              />
            }
          </div>
        </div>
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
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-[75%] group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
