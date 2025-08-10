"use client";

import equal from "fast-deep-equal";
import type { Session } from "next-auth";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "~/types";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useDataStream } from "~/components/chat/data-stream/provider";

export interface UseAutoResumeParams {
  id: string;
  session: Session;
  autoResume: boolean;
  initialMessages: ChatMessage[];
  resumeStream: UseChatHelpers<ChatMessage>["resumeStream"];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}

export function useAutoResume({
  id,
  session,
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
}: UseAutoResumeParams) {
  const { dataStream } = useDataStream();
  const isClientInitiatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      resumeStream();
      isClientInitiatedRef.current = true;
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When server-sourced initialMessages change (e.g., another client sent a
  // message), merge any new items by id into the local messages and, if the
  // newest is a user message, resume the stream to fetch the assistant reply.
  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) return;

    // Merge: add any server messages that don't exist locally.
    setMessages((prev) => {
      if (!prev || prev.length === 0) return initialMessages;

      const existingIds = new Set(prev.map((m) => m.id));
      const newItems = initialMessages.filter((m) => !existingIds.has(m.id));
      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });

    // If the latest server message is a user message, we should resume the
    // stream to receive the assistant response, but avoid doing so when this
    // same client initiated the request (stream already active).
    const latest = initialMessages.at(-1);
    if (
      autoResume &&
      latest?.role === "user" &&
      !isClientInitiatedRef.current
    ) {
      resumeStream();
      isClientInitiatedRef.current = true;
    }

    // If the latest message is from the assistant, consider the previous
    // streaming cycle complete and allow future auto-resumes.
    if (latest?.role === "assistant") {
      isClientInitiatedRef.current = false;
    }
  // Only run when the array identity changes and not for every render – callers
  // pass preloaded data that changes on Convex updates, so this is safe.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

  useEffect(() => {
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[0];

    if (dataPart.type === "data-appendMessage") {
      const message = JSON.parse(dataPart.data);
      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === message.id);
        if (index === -1) return [...prev, message];
        const next = prev.slice();
        if (equal(prev[index], message)) return prev;
        next[index] = message;
        return next;
      });

      if (message.role === "user") {
        isClientInitiatedRef.current = true;
      } else if (message.role === "assistant") {
        // Mark cycle complete when assistant is observed via restored stream.
        isClientInitiatedRef.current = false;
      }
    }
  }, [dataStream, setMessages]);
}
