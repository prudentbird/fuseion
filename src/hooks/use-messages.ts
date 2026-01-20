import { useEffect } from "react";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";

export function useMessages({
  chatId,
  status,
}: {
  chatId: string;
  status: UseChatHelpers<UIMessage>["status"];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const hasSentMessage = status === "submitted";

  useEffect(() => {
    if (chatId && status === "submitted") {
      scrollToBottom("instant");
    }
  }, [chatId, scrollToBottom, status]);

  useEffect(() => {
    if (chatId) {
      scrollToBottom("instant");
    }
  }, [chatId, scrollToBottom]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
}
