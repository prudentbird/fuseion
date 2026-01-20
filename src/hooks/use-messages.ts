import { useRef, useEffect, useMemo } from "react";
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

  const prevStatusRef = useRef(status);
  const hasSentMessage = useMemo(() => {
    const wasSubmitted = prevStatusRef.current === "submitted";
    prevStatusRef.current = status;
    return status === "submitted" || wasSubmitted;
  }, [status]);

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
