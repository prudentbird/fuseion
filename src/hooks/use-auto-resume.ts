"use client";

import { useEffect } from "react";
import equal from "fast-deep-equal";
import type { Session } from "next-auth";
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

  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      resumeStream();
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
    let shouldResume = false;
    setMessages((prev) => {
      if (!prev || prev.length === 0) return initialMessages;

      const idToIndex = new Map<string, number>(prev.map((m, i) => [m.id, i]));
      let changed = false;
      const next = prev.slice();

      for (const serverMsg of initialMessages) {
        const idx = idToIndex.get(serverMsg.id);
        if (idx === undefined) {
          next.push(serverMsg);
          changed = true;
        } else if (!equal(next[idx], serverMsg)) {
          next[idx] = serverMsg;
          changed = true;
        }
      }

      const latest = initialMessages.at(-1);
      if (
        autoResume &&
        latest?.role === "user" &&
        latest?.id &&
        !idToIndex.has(latest.id)
      ) {
        shouldResume = true;
      }

      return changed ? next : prev;
    });

    if (shouldResume) {
      resumeStream();
    }

    // Only run when the array identity changes and not for every render – callers
    // pass preloaded data that changes on Convex updates, so this is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages]);

  useEffect(() => {
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[dataStream.length - 1];

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
    }
  }, [dataStream, setMessages]);
}
