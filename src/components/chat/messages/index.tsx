import { memo } from "react";
import equal from "fast-deep-equal";
import { Greeting } from "./greeting";
import { ChatMessage } from "~/types";
import { motion } from "framer-motion";
import { ErrorMessage } from "./error";
import type { Session } from "next-auth";
import { ChatSDKError } from "~/lib/errors";
import type { UseChatHelpers } from "@ai-sdk/react";
import { PreviewMessage, ThinkingMessage } from "./message";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";

interface MessagesProps {
  session: Session;
  error: Error | undefined;
  status: UseChatHelpers<ChatMessage>["status"];
  messages: Array<ChatMessage>;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}

function PureMessages({
  error,
  session,
  status,
  messages,
  setMessages,
  regenerate,
}: MessagesProps) {
  const hasSentMessage = status === "submitted";

  return (
    <Conversation className="h-full">
      <ConversationContent className="mx-auto w-full max-w-3xl px-4 pb-40 pt-safe-offset-10">
        {messages.length === 0 ? <Greeting session={session} /> : null}

        {messages.map((message, index) => (
          <PreviewMessage
            key={`${message.id}-${index}`}
            isLoading={status === "streaming" && messages.length - 1 === index}
            message={message}
            regenerate={regenerate}
            requiresScrollPadding={
              hasSentMessage && index === messages.length - 1 && !error
            }
            setMessages={setMessages}
          />
        ))}

        {status === "submitted" &&
          !error &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <ThinkingMessage />}

        {error ? (
          <motion.div
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            className="w-full min-h-96"
            data-role="assistant"
            data-testid="message-assistant-error"
            initial={{ y: 5, opacity: 0 }}
          >
            <ErrorMessage
              error={
                error instanceof ChatSDKError
                  ? error.message
                  : "Something went wrong"
              }
            />
          </motion.div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
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
