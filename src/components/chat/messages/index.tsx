import { memo } from "react";
import equal from "fast-deep-equal";
import { Greeting } from "./greeting";
import { ChatMessage } from "~/types";
import { motion } from "framer-motion";
import { ErrorMessage } from "./error";
import type { Session } from "next-auth";
import { ChatSDKError } from "~/lib/errors";
import { useMessages } from "~/hooks/use-messages";
import type { UseChatHelpers } from "@ai-sdk/react";
import { PreviewMessage, ThinkingMessage } from "./message";

interface MessagesProps {
  chatId: string;
  session: Session;
  error: Error | undefined;
  status: UseChatHelpers<ChatMessage>["status"];
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

function PureMessages({
  error,
  chatId,
  session,
  status,
  messages,
  setMessages,
  regenerate,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 pt-4"
    >
      {messages.length === 0 && <Greeting session={session} />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={`${message.id}-${index}`}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          regenerate={regenerate}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      {error && (
        <div className="flex gap-4 w-full mx-auto max-w-3xl px-4">
          <div className="flex flex-col gap-2 w-full">
            <ErrorMessage
              error={
                error instanceof ChatSDKError
                  ? error.message
                  : "Something went wrong"
              }
            />
          </div>
        </div>
      )}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        style={{ scrollMarginBottom: 128 }}
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status === "streaming" || nextProps.status === "streaming")
    return false;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
