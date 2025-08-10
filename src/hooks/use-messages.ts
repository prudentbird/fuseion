import { useState, useEffect } from "react";
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

  const [hasSentMessage, setHasSentMessage] = useState(false);

  useEffect(() => {
    if (chatId && status === "submitted") {
      scrollToBottom("instant");
      setHasSentMessage(false);
    }
  }, [chatId, scrollToBottom, status]);

  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
    }
  }, [status]);

  useEffect(() => {
    if (chatId && !isAtBottom) {
      scrollToBottom("instant");
    }
  }, [chatId, isAtBottom, scrollToBottom]);

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
