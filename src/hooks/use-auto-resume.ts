"use client";

import { useQuery } from "convex/react";
import type { Session } from "next-auth";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "~/types";
import { api } from "~/convex/_generated/api";
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
  const prevThreadStatusRef = useRef<string | undefined>(undefined);
  const isClientInitiatedRef = useRef<boolean>(false);

  const threadData = useQuery(
    api.threads.getThreadByUserIdAndThreadId,
    session?.user?.userId && id
      ? {
          userId: session.user.userId,
          threadId: id,
        }
      : "skip",
  );

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

  useEffect(() => {
    if (!threadData) return;

    const currentStatus = threadData.status;
    const prevStatus = prevThreadStatusRef.current;

    if (
      currentStatus === "streaming" &&
      prevStatus !== "streaming" &&
      !isClientInitiatedRef.current
    ) {
      resumeStream();
    }

    if (currentStatus === "done") {
      isClientInitiatedRef.current = false;
    }

    prevThreadStatusRef.current = currentStatus;
  }, [threadData, resumeStream]);

  useEffect(() => {
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[0];

    if (dataPart.type === "data-appendMessage") {
      const message = JSON.parse(dataPart.data);
      setMessages([...initialMessages, message]);

      if (message.role === "user") {
        isClientInitiatedRef.current = true;
      }
    }
  }, [dataStream, initialMessages, setMessages]);
}
